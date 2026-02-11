const todoDBContext = require("../db/todoDBContext");

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
    const rows = await todoDBContext.listTodos(completed);
    return rows.map(toTodo);
  }

  async get(id) {
    const row = await todoDBContext.getTodoById(id);
    return toTodo(row);
  }

  async search(keyword) {
    const term = keyword.trim();
    const rows = await todoDBContext.searchTodos(term);
    return rows.map(toTodo);
  }

  async create({ title, completed }) {
    const payload = {
      title: title.trim(),
      completed: Boolean(completed),
      createdAt: new Date().toISOString(),
    };

    const result = await todoDBContext.insertTodo(payload);
    const row = await todoDBContext.getTodoById(result.lastID);
    return toTodo(row);
  }

  async replace(id, { title, completed }) {
    const trimmedTitle = title.trim();
    const result = await todoDBContext.updateTodo(id, {
      title: trimmedTitle,
      completed,
    });
    if (result.changes === 0) return null;
    const row = await todoDBContext.getTodoById(id);
    return toTodo(row);
  }

  async update(id, { title, completed }) {
    const existing = await todoDBContext.getTodoById(id);
    if (!existing) return null;

    const newTitle = title !== undefined ? title.trim() : existing.title;
    const newCompleted = completed !== undefined ? (completed ? 1 : 0) : existing.completed;

    await todoDBContext.updateTodo(id, {
      title: newTitle,
      completed: newCompleted,
    });

    const row = await todoDBContext.getTodoById(id);
    return toTodo(row);
  }

  async delete(id) {
    const existing = await todoDBContext.getTodoById(id);
    if (!existing) return null;

    await todoDBContext.deleteTodo(id);
    return toTodo(existing);
  }
}

module.exports = TodoService;
