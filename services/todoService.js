const todoDBContext = require("../db/todoDBContext");
const Todo = require("../domain/Todo");

class TodoService {
  async list(completed) {
    return todoDBContext.listTodos(completed);
  }

  async get(id) {
    return todoDBContext.getTodoById(id);
  }

  async search(keyword) {
    const term = keyword.trim();
    return todoDBContext.searchTodos(term);
  }

  async create({ title, completed }) {
    const todo = new Todo({
      title: title.trim(),
      completed: Boolean(completed),
      createdAt: new Date().toISOString(),
    });

    const result = await todoDBContext.insertTodo(todo);
    return todoDBContext.getTodoById(result.lastID);
  }

  async replace(id, { title, completed }) {
    const trimmedTitle = title.trim();
    const todo = new Todo({
      id,
      title: trimmedTitle,
      completed: Boolean(completed),
      createdAt: new Date().toISOString(),
    });

    const result = await todoDBContext.updateTodo(id, todo);
    if (result.changes === 0) return null;
    return todoDBContext.getTodoById(id);
  }

  async update(id, { title, completed }) {
    const existing = await todoDBContext.getTodoById(id);
    if (!existing) return null;

    const todo = new Todo({
      id,
      title: title !== undefined ? title.trim() : existing.title,
      completed: completed !== undefined ? Boolean(completed) : existing.completed,
      createdAt: existing.createdAt,
    });

    await todoDBContext.updateTodo(id, todo);
    return todoDBContext.getTodoById(id);
  }

  async delete(id) {
    const existing = await todoDBContext.getTodoById(id);
    if (!existing) return null;

    await todoDBContext.deleteTodo(id);
    return existing;
  }
}

module.exports = TodoService;
