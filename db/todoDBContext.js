const { runAsync, getAsync, allAsync } = require("./db");
const Todo = require("../domain/Todo");

const listTodos = async (completed) => {
  let query = "SELECT * FROM todos";
  const params = [];

  if (completed === "true") {
    query += " WHERE completed = 1";
  } else if (completed === "false") {
    query += " WHERE completed = 0";
  }

  const rows = await allAsync(query, params);
  return rows.map(Todo.fromRow);
};

const getTodoById = async (id) => {
  const row = await getAsync("SELECT * FROM todos WHERE id = ?", [id]);
  return Todo.fromRow(row);
};

const searchTodos = async (term) => {
  const rows = await allAsync("SELECT * FROM todos WHERE title LIKE ?", [`%${term}%`]);
  return rows.map(Todo.fromRow);
};

const insertTodo = async (todo) =>
  runAsync("INSERT INTO todos (title, completed, createdAt) VALUES (?, ?, ?)", [
    todo.title,
    todo.completed ? 1 : 0,
    todo.createdAt,
  ]);

const updateTodo = async (id, todo) =>
  runAsync("UPDATE todos SET title = ?, completed = ? WHERE id = ?", [
    todo.title,
    todo.completed ? 1 : 0,
    id,
  ]);

const deleteTodo = async (id) => runAsync("DELETE FROM todos WHERE id = ?", [id]);

module.exports = {
  listTodos,
  getTodoById,
  searchTodos,
  insertTodo,
  updateTodo,
  deleteTodo,
};
