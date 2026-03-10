class TodoDto {
  static fromDomain(todo) {
    if (!todo) return null;
    return {
      id: todo.id,
      title: todo.title,
      completed: Boolean(todo.completed),
    };
  }

  static fromDomainList(todos) {
    return todos.map(TodoDto.fromDomain);
  }
}

module.exports = TodoDto;
