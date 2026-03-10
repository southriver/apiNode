'use strict';

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const Database = require('better-sqlite3');
const swaggerUi = require('swagger-ui-express');
const swaggerDoc = require('./docs/openapi.json');

const app = express();
const PORT = process.env.PORT || 3000;
const swaggerDocument = { ...swaggerDoc, servers: [{ url: '/' }] };

// --- Middleware ---
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

// --- DB ---
const db = new Database(process.env.DB_FILE || 'todo_0.db');

// Create tables
db.exec(`
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS todos (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    title       TEXT NOT NULL,
    completed   INTEGER NOT NULL DEFAULT 0 CHECK (completed IN (0,1)),
    dueDate     TEXT NULL, -- ISO string e.g. 2026-03-01
    createdAt   TEXT NOT NULL,
    updatedAt   TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_todos_completed ON todos(completed);
  CREATE INDEX IF NOT EXISTS idx_todos_createdAt ON todos(createdAt);
`);

function nowIso() {
  return new Date().toISOString();
}

function toBoolInt(v) {
  return v ? 1 : 0;
}

function parseCompleted(value) {
  // Accept true/false, 1/0, "true"/"false"
  if (value === undefined) return undefined;
  if (value === true || value === 1 || value === '1' || value === 'true') return 1;
  if (value === false || value === 0 || value === '0' || value === 'false') return 0;
  return null;
}

function mapTodo(row) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    completed: !!row.completed,
    dueDate: row.dueDate,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt
  };
}

// --- Health ---
app.get('/health', (req, res) => res.json({ ok: true }));
app.get('/', (req, res) => {
  res.json({
    service: 'Todo API',
    status: 'running',
    endpoints: ['/health', '/todos']
  });
});

// --- Routes ---

// GET /todos?completed=true|false&limit=20&offset=0&q=search
app.get('/todos', (req, res) => {
  const limit = Math.min(parseInt(req.query.limit ?? '20', 10) || 20, 100);
  const offset = Math.max(parseInt(req.query.offset ?? '0', 10) || 0, 0);
  const q = (req.query.q ?? '').toString().trim();

  const completed = parseCompleted(req.query.completed);
  if (req.query.completed !== undefined && completed === null) {
    return res.status(400).json({ error: 'completed must be true/false (or 1/0)' });
  }

  const where = [];
  const params = {};

  if (completed !== undefined) {
    where.push('completed = @completed');
    params.completed = completed;
  }

  if (q) {
    where.push('title LIKE @q');
    params.q = `%${q}%`;
  }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const total = db
    .prepare(`SELECT COUNT(*) as cnt FROM todos ${whereSql}`)
    .get(params).cnt;

  const rows = db
    .prepare(`
      SELECT * FROM todos
      ${whereSql}
      ORDER BY createdAt DESC
      LIMIT @limit OFFSET @offset
    `)
    .all({ ...params, limit, offset });

  res.json({
    total,
    limit,
    offset,
    items: rows.map(mapTodo)
  });
});

// GET /todos/:id
app.get('/todos/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'Invalid id' });

  const row = db.prepare('SELECT * FROM todos WHERE id = ?').get(id);
  if (!row) return res.status(404).json({ error: 'Todo not found' });

  res.json(mapTodo(row));
});

// POST /todos
app.post('/todos', (req, res) => {
  const { title, completed, dueDate } = req.body ?? {};

  if (typeof title !== 'string' || title.trim().length < 1) {
    return res.status(400).json({ error: 'title is required' });
  }
  if (title.trim().length > 200) {
    return res.status(400).json({ error: 'title must be <= 200 chars' });
  }

  const completedInt = parseCompleted(completed);
  if (completed !== undefined && completedInt === null) {
    return res.status(400).json({ error: 'completed must be true/false (or 1/0)' });
  }

  if (dueDate !== undefined && dueDate !== null && typeof dueDate !== 'string') {
    return res.status(400).json({ error: 'dueDate must be an ISO date string or null' });
  }

  const t = nowIso();
  const info = db
    .prepare(`
      INSERT INTO todos (title, completed, dueDate, createdAt, updatedAt)
      VALUES (@title, @completed, @dueDate, @createdAt, @updatedAt)
    `)
    .run({
      title: title.trim(),
      completed: completedInt ?? 0,
      dueDate: dueDate ?? null,
      createdAt: t,
      updatedAt: t
    });

  const created = db.prepare('SELECT * FROM todos WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json(mapTodo(created));
});

// PATCH /todos/:id  (partial update)
app.patch('/todos/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'Invalid id' });

  const existing = db.prepare('SELECT * FROM todos WHERE id = ?').get(id);
  if (!existing) return res.status(404).json({ error: 'Todo not found' });

  const { title, completed, dueDate } = req.body ?? {};

  if (title !== undefined) {
    if (typeof title !== 'string' || title.trim().length < 1) {
      return res.status(400).json({ error: 'title must be a non-empty string' });
    }
    if (title.trim().length > 200) {
      return res.status(400).json({ error: 'title must be <= 200 chars' });
    }
  }

  const completedInt = parseCompleted(completed);
  if (completed !== undefined && completedInt === null) {
    return res.status(400).json({ error: 'completed must be true/false (or 1/0)' });
  }

  if (dueDate !== undefined && dueDate !== null && typeof dueDate !== 'string') {
    return res.status(400).json({ error: 'dueDate must be an ISO date string or null' });
  }

  const updatedAt = nowIso();
  const newTitle = title !== undefined ? title.trim() : existing.title;
  const newCompleted = completed !== undefined ? completedInt : existing.completed;
  const newDueDate = dueDate !== undefined ? dueDate : existing.dueDate;

  db.prepare(`
    UPDATE todos
    SET title = @title,
        completed = @completed,
        dueDate = @dueDate,
        updatedAt = @updatedAt
    WHERE id = @id
  `).run({
    id,
    title: newTitle,
    completed: newCompleted,
    dueDate: newDueDate,
    updatedAt
  });

  const row = db.prepare('SELECT * FROM todos WHERE id = ?').get(id);
  res.json(mapTodo(row));
});

// DELETE /todos/:id
app.delete('/todos/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'Invalid id' });

  const info = db.prepare('DELETE FROM todos WHERE id = ?').run(id);
  if (info.changes === 0) return res.status(404).json({ error: 'Todo not found' });

  res.status(204).send();
});

// Swagger UI
app.get('/docs/openapi.json', (req, res) => {
  res.json(swaggerDocument);
});
app.get('/openapi.json', (req, res) => {
  res.json(swaggerDocument);
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// --- Error fallback ---
app.use((req, res) => res.status(404).json({ error: 'Not found' }));

app.listen(PORT, () => {
  console.log(`Todo API running on http://localhost:${PORT}`);
});
