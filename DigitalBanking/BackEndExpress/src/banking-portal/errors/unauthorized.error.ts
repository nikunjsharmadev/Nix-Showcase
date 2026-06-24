import { STRING_CONSTANT } from "../shared/constants/messages.constants.js";
import { AppError } from "./app.error.js";

export class UnauthorizedError extends AppError {
  constructor(message = STRING_CONSTANT.error.unauthorized) {
    super(401, message);
  }
}
