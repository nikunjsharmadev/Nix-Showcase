import { STRING_CONSTANT } from "../shared/constants/messages.constants.js";
import { AppError } from "./app.error.js";

export class BadRequestError extends AppError {
  constructor(message = STRING_CONSTANT.error.badRequest) {
    super(400, message);
  }
}
