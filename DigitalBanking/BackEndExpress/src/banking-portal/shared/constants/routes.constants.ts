export const API_ROUTES = {
  root: "/",
  auth: {
    root: "/auth",
    server: "/server",
    register: "/register",
    login: "/login",
    resendVerifyEmail: "/resend-verify-email",
    verifyEmail: "/verify-email",
    forgotPassword: "/forgot-password",
    resetPassword: "/reset-password",
  },
  users: {
    root: "/users",
    server: "/server",
  },
} as const;
