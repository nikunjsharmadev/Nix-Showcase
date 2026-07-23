import express, { Router } from 'express';
import { API_ROUTES } from '../constants/index.js';
import { AuthController, UserController } from '../controllers/index.js';
import { route } from '../utils/index.js';
import { AuthMiddleware } from '../middlewares/index.js';
import { Role } from '../types/index.js';
// ROUTES(routes.ts)
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
  const authMiddleware = AuthMiddleware;
  const authPaths = API_ROUTES.auth;
  router.post(`${authPaths.login}`, asyncWrapper(authCtrl().login));
  router.post(`${authPaths.register}`, asyncWrapper(authCtrl().registerUser));
  router.get(`${authPaths.verifyEmail}`, asyncWrapper(authCtrl().verifyEmail));
  router.post(`${authPaths.resendVerifyEmail}`, asyncWrapper(authCtrl().resendVerifyEmail));
  router.post(`${authPaths.forgotPasswordLink}`, asyncWrapper(authCtrl().getResetPasswordLink));
  router.post(`${authPaths.resetPassword}`, asyncWrapper(authCtrl().resetPassword));
  router.get(`${authPaths.me}`, asyncWrapper(authMiddleware().authenticate), asyncWrapper(authCtrl().me));
  return router;
}
// user
export function UserRoutes(router: Router) {
  const userCtrl = UserController;
  const authMiddleware = AuthMiddleware;
  const userPaths = API_ROUTES.users;
  router.use(asyncWrapper(authMiddleware().authenticate));
  router.get(userPaths.root, authorizeWrapper(Role.ADMIN), asyncWrapper(userCtrl().getPaginatedUsers));
  router.post(userPaths.root, asyncWrapper(userCtrl().registerUser));
  return router;
}
