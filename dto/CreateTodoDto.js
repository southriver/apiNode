const DtoValidationError = require("./DtoValidationError");

class CreateTodoDto {
  constructor({ title, completed = false }) {
    this.title = title;
    this.completed = completed;
  }

  static fromRequest(body) {
    const { title, completed = false } = body ?? {};

    if (typeof title !== "string" || title.trim() === "") {
      throw new DtoValidationError("Field 'title' is required and must be a string");
    }

    return new CreateTodoDto({
      title: title.trim(),
      completed: Boolean(completed),
    });
  }

  toServiceInput() {
    return {
      title: this.title,
      completed: this.completed,
    };
  }
}

module.exports = CreateTodoDto;
