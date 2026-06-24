import { STRING_CONSTANT } from "../shared/constants/messages.constants.js";
import { AppError } from "./app.error.js";

export class Forbidden extends AppError {
  constructor(message = STRING_CONSTANT.error.forbidden) {
    super(403, message);
  }
}
