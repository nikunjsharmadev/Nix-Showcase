import express, { type Request, type Response } from "express";
import { API_ROUTES, STRING_CONSTANT } from "../../shared/constants/index.js";
import { getUsers, registerUser } from "./user.controller.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";
const router = express.Router();
router.get(API_ROUTES.users.server, (req: Request, res: Response) => {
  res.status(200).json({
    message: STRING_CONSTANT.apiStatus.user,
  });
});
router.use(authMiddleware);
router
  .route(API_ROUTES.root)
  .get(asyncHandler(getUsers))
  .post(asyncHandler(registerUser));
export const UserRoutes = router;
