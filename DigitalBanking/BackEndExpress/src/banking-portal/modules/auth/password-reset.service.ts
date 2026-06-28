import crypto from "crypto";
export const createResetToken = () => {
  const token = crypto.randomBytes(32).toString("hex");
  const hasedToken = crypto.createHash("sha256").update(token).digest("hex");
  return { token, hasedToken };
};
export const getHashedToken = (token: string) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};
