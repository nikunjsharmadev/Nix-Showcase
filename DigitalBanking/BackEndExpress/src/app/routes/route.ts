import express, { Router } from 'express';
import { API_ROUTES } from '../constants/index.js';
import { AuthController, UserController } from '../controllers/index.js';
import { route } from '../utils/index.js';
import { AuthMiddleware } from '../middlewares/index.js';
import { Role } from '../types/index.js';
// app
export function AppRoutes() {
  const router = express.Router();
  router.use(`${API_ROUTES.auth.root}`, AuthRoutes(router));
  router.use(`${API_ROUTES.users.root}`, UserRoutes(router));
  return router;
}
// auth
export function AuthRoutes(router: Router) {
  const authCtrl = AuthController;
  const authPaths = API_ROUTES.auth;
  route(router, 'post', authPaths.register, authCtrl().registerUser);
  route(router, 'post', authPaths.login, authCtrl().login);
  route(router, 'get', authPaths.verifyEmail, authCtrl().verifyEmail);
  route(router, 'post', authPaths.resendVerifyEmail, authCtrl().resendVerifyEmail);
  route(router, 'post', authPaths.forgotPasswordLink, authCtrl().getResetPasswordLink);
  route(router, 'post', authPaths.resetPassword, authCtrl().resetPassword);
  return router;
}
// user
export function UserRoutes(router: Router) {
  const userCtrl = UserController;
  const authMiddleware = AuthMiddleware;
  const userPaths = API_ROUTES.users;
  router.use(authMiddleware().authenticate);
  route(router, 'get', userPaths.root, userCtrl().getPaginatedUsers, Role.ADMIN);
  route(router, 'post', userPaths.root, userCtrl().registerUser);
  return router;
}
