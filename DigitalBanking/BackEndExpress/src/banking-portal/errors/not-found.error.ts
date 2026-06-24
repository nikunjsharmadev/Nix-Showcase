import { AppError } from "./app.error.js";
import { STRING_CONSTANT } from "../shared/constants/messages.constants.js";

export class NotFoundError extends AppError {
  constructor(message = STRING_CONSTANT.error.notFound) {
    super(404, message);
  }
}
