const express = require("express");
const swaggerUi = require("swagger-ui-express");
const swaggerDoc = require("./docs/openapi.json");
const TodoService = require("./services/todoService");
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON body
app.use(express.json());

// Swagger document loaded from file; set server to relative origin so it works locally and when deployed
const swaggerDocument = { ...swaggerDoc, servers: [{ url: "/" }] };

const todoService = new TodoService();

/**
 * GET /todos
 * Optional query: ?completed=true/false
 */
app.get("/todos", async (req, res) => {
  const { completed } = req.query;

  try {
    const todos = await todoService.list(completed);
    res.json(todos);
  } catch (err) {
    console.error("Failed to list todos", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * GET /todos/search
 * Query: keyword (required)
 */
app.get("/todos/search", async (req, res) => {
  const { keyword } = req.query;

  if (!keyword || typeof keyword !== "string" || keyword.trim() === "") {
    return res.status(400).json({ error: "Query parameter 'keyword' is required" });
  }

  try {
    const todos = await todoService.search(keyword);
    res.json(todos);
  } catch (err) {
    console.error("Failed to search todos", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * GET /todos/:id
 */
app.get("/todos/:id", async (req, res) => {
  const id = Number(req.params.id);

  try {
    const todo = await todoService.get(id);
    if (!todo) {
      return res.status(404).json({ error: "Todo not found" });
    }
    res.json(todo);
  } catch (err) {
    console.error("Failed to fetch todo", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * POST /todos
 * Body: { "title": "Buy milk", "completed": false }
 * title is required
 */
app.post("/todos", async (req, res) => {
  const { title, completed = false } = req.body;

  if (!title || typeof title !== "string") {
    return res.status(400).json({ error: "Field 'title' is required and must be a string" });
  }

  try {
    const todo = await todoService.create({ title, completed });
    res.status(201).json(todo);
  } catch (err) {
    console.error("Failed to create todo", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * PUT /todos/:id
 * Full replace (title & completed required)
 */
app.put("/todos/:id", async (req, res) => {
  const id = Number(req.params.id);

  const { title, completed } = req.body;

  if (!title || typeof title !== "string") {
    return res.status(400).json({ error: "Field 'title' is required and must be a string" });
  }

  if (typeof completed !== "boolean") {
    return res
      .status(400)
      .json({ error: "Field 'completed' is required and must be a boolean" });
  }

  try {
    const updated = await todoService.replace(id, { title, completed });
    if (!updated) {
      return res.status(404).json({ error: "Todo not found" });
    }
    res.json(updated);
  } catch (err) {
    console.error("Failed to replace todo", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * PATCH /todos/:id
 * Partial update (title or completed or both)
 */
app.patch("/todos/:id", async (req, res) => {
  const id = Number(req.params.id);

  const { title, completed } = req.body;

  if (title !== undefined) {
    if (typeof title !== "string") {
      return res.status(400).json({ error: "Field 'title' must be a string" });
    }
  }

  if (completed !== undefined) {
    if (typeof completed !== "boolean") {
      return res.status(400).json({ error: "Field 'completed' must be a boolean" });
    }
  }

  try {
    const updated = await todoService.update(id, { title, completed });
    if (!updated) {
      return res.status(404).json({ error: "Todo not found" });
    }
    res.json(updated);
  } catch (err) {
    console.error("Failed to update todo", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * DELETE /todos/:id
 */
app.delete("/todos/:id", async (req, res) => {
  const id = Number(req.params.id);

  try {
    const deleted = await todoService.delete(id);
    if (!deleted) {
      return res.status(404).json({ error: "Todo not found" });
    }
    res.json({ message: "Todo deleted", todo: deleted });
  } catch (err) {
    console.error("Failed to delete todo", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Health check
app.get("/", (req, res) => {
  res.send("Todo API is running ✅");
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.listen(PORT, () => {
  console.log(`Todo API listening on http://localhost:${PORT}`);
});
