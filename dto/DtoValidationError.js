class DtoValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "DtoValidationError";
    this.statusCode = 400;
  }
}

module.exports = DtoValidationError;
