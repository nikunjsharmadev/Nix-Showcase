import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import express, { type Request, type Response } from "express";
import helmet from "helmet";
import { UserRoutes } from "./modules/users/user.routes.js";
import { errorHandler } from "./middleware/error.middleware.js";
import { API_ROUTES } from "./shared/constants/routes.constants.js";
import { AuthRoutes } from "./modules/auth/auth.routes.js";
const secret = process.env.JWT_SECRET;
if (!secret) throw new Error("JWT_SECRET missing");
import connectDb from "./config/db.js";
import { STRING_CONSTANT } from "./shared/constants/messages.constants.js";
const app = express();
app.use(cors({ origin: [process.env.FRONTEND_URL_LOCAL!], credentials: true }));
app.disable("x-powered-by");
app.use(
  helmet({
    contentSecurityPolicy: false,
    referrerPolicy: { policy: "no-referrer" },
    strictTransportSecurity: { maxAge: 31536000, includeSubDomains: true },
    xFrameOptions: { action: "deny" },
    crossOriginResourcePolicy: {
      policy: "cross-origin",
    },
  }),
);
app.use(express.json());
app.get(API_ROUTES.root, (req: Request, res: Response) => {
  res.status(200).json({
    message: STRING_CONSTANT.apiStatus.root,
  });
});
app.use(API_ROUTES.auth.root, AuthRoutes);
app.use(API_ROUTES.users.root, UserRoutes);
app.use(errorHandler);
connectDb();
export const bankApi = app;
