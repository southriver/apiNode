const { runAsync, getAsync, allAsync } = require("../db/db");

const toTodo = (row) =>
  row
    ? {
        id: row.id,
        title: row.title,
        completed: Boolean(row.completed),
        createdAt: row.createdAt,
      }
    : null;

class TodoService {
  async list(completed) {
    let query = "SELECT * FROM todos";
    const params = [];
    if (completed === "true") {
      query += " WHERE completed = 1";
    } else if (completed === "false") {
      query += " WHERE completed = 0";
    }
    const rows = await allAsync(query, params);
    return rows.map(toTodo);
  }

  async get(id) {
    const row = await getAsync("SELECT * FROM todos WHERE id = ?", [id]);
    return toTodo(row);
  }

  async search(keyword) {
    const term = keyword.trim();
    const rows = await allAsync("SELECT * FROM todos WHERE title LIKE ?", [`%${term}%`]);
    return rows.map(toTodo);
  }

  async create({ title, completed }) {
    const payload = {
      title: title.trim(),
      completed: Boolean(completed),
      createdAt: new Date().toISOString(),
    };

    const result = await runAsync(
      "INSERT INTO todos (title, completed, createdAt) VALUES (?, ?, ?)",
      [payload.title, payload.completed ? 1 : 0, payload.createdAt]
    );
    const row = await getAsync("SELECT * FROM todos WHERE id = ?", [result.lastID]);
    return toTodo(row);
  }

  async replace(id, { title, completed }) {
    const trimmedTitle = title.trim();
    const result = await runAsync("UPDATE todos SET title = ?, completed = ? WHERE id = ?", [
      trimmedTitle,
      completed ? 1 : 0,
      id,
    ]);
    if (result.changes === 0) return null;
    const row = await getAsync("SELECT * FROM todos WHERE id = ?", [id]);
    return toTodo(row);
  }

  async update(id, { title, completed }) {
    const existing = await getAsync("SELECT * FROM todos WHERE id = ?", [id]);
    if (!existing) return null;

    const newTitle = title !== undefined ? title.trim() : existing.title;
    const newCompleted = completed !== undefined ? (completed ? 1 : 0) : existing.completed;

    await runAsync("UPDATE todos SET title = ?, completed = ? WHERE id = ?", [
      newTitle,
      newCompleted,
      id,
    ]);

    const row = await getAsync("SELECT * FROM todos WHERE id = ?", [id]);
    return toTodo(row);
  }

  async delete(id) {
    const existing = await getAsync("SELECT * FROM todos WHERE id = ?", [id]);
    if (!existing) return null;

    await runAsync("DELETE FROM todos WHERE id = ?", [id]);
    return toTodo(existing);
  }
}

module.exports = TodoService;
