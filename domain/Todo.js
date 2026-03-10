class Todo {
  constructor({ id = null, title, completed = false, createdAt }) {
    this.id = id;
    this.title = title;
    this.completed = Boolean(completed);
    this.createdAt = createdAt;
  }

  static fromRow(row) {
    if (!row) return null;
    return new Todo({
      id: row.id,
      title: row.title,
      completed: row.completed,
      createdAt: row.createdAt,
    });
  }

  toDbValues() {
    return {
      title: this.title,
      completed: this.completed ? 1 : 0,
      createdAt: this.createdAt,
    };
  }
}

module.exports = Todo;
