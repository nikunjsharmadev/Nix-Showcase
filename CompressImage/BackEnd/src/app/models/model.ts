// MODELS
// ERROR CUSTOM CLASS
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public success = false,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.success = false;
  }
}
