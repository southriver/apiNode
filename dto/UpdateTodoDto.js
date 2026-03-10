const DtoValidationError = require("./DtoValidationError");

class UpdateTodoDto {
  constructor({ title, completed }) {
    this.title = title;
    this.completed = completed;
  }

  static fromPutRequest(body) {
    const { title, completed } = body ?? {};

    if (typeof title !== "string" || title.trim() === "") {
      throw new DtoValidationError("Field 'title' is required and must be a string");
    }

    if (typeof completed !== "boolean") {
      throw new DtoValidationError("Field 'completed' is required and must be a boolean");
    }

    return new UpdateTodoDto({
      title: title.trim(),
      completed,
    });
  }

  static fromPatchRequest(body) {
    const { title, completed } = body ?? {};

    if (title !== undefined && typeof title !== "string") {
      throw new DtoValidationError("Field 'title' must be a string");
    }

    if (completed !== undefined && typeof completed !== "boolean") {
      throw new DtoValidationError("Field 'completed' must be a boolean");
    }

    return new UpdateTodoDto({
      title: title !== undefined ? title.trim() : undefined,
      completed,
    });
  }

  toServiceInput() {
    return {
      title: this.title,
      completed: this.completed,
    };
  }
}

module.exports = UpdateTodoDto;
