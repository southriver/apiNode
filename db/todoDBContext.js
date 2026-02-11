const { runAsync, getAsync, allAsync } = require("./db");

const listTodos = async (completed) => {
  let query = "SELECT * FROM todos";
  const params = [];

  if (completed === "true") {
    query += " WHERE completed = 1";
  } else if (completed === "false") {
    query += " WHERE completed = 0";
  }

  return allAsync(query, params);
};

const getTodoById = async (id) => getAsync("SELECT * FROM todos WHERE id = ?", [id]);

const searchTodos = async (term) =>
  allAsync("SELECT * FROM todos WHERE title LIKE ?", [`%${term}%`]);

const insertTodo = async ({ title, completed, createdAt }) =>
  runAsync("INSERT INTO todos (title, completed, createdAt) VALUES (?, ?, ?)", [
    title,
    completed ? 1 : 0,
    createdAt,
  ]);

const updateTodo = async (id, { title, completed }) =>
  runAsync("UPDATE todos SET title = ?, completed = ? WHERE id = ?", [
    title,
    completed ? 1 : 0,
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
