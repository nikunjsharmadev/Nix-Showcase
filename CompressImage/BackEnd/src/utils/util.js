import dotenv from "dotenv";
dotenv.config();
import multer from "multer";
import { UPLOAD_DIR, UPLOAD_FIELDS, CHARS_SET } from "../consts/index.js";

// CHECK SERVER HEALTH
export async function checkAppHealth(req, res, next) {
  res.status(200).json({
    success: true,
    message: "Welcome to CompressImage APIs App",
  });
}
// GET RANDOM NAMES
export function getRandomName(length = 5) {
  const chars = Array.from(
    { length },
    () => CHARS_SET[Math.floor(Math.random() * CHARS_SET.length)],
  );
  return makeFirstCharCapital(chars.join(""));
}
export function makeFirstCharCapital(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
// ERROR HANDLING SERVER
export function handleFatalError(err) {
  console.error(err);
  process.exit(1);
}
// ERROR HANDLING APIs
export function catchApiError(err, req, res, next) {
  console.error({
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
  });
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal server error, please try again later",
  });
}
// ERROR CUSTOM CLASS
export class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.success = false;
  }
}
// PAGENOTFOUND 404
export function pageNotFound(req, res, next) {
  res.status(404).json({
    success: false,
    message: `Try with different API endpoint, no url found: '${req.originalUrl}'`,
  });
}
// ASYNC ROUTE WRAPPER HANDLER
export function asyncWrapper(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((err) => next(err));
  };
}
// LOG RESPONSE PROCESS TIME OF APIS
export function logTime(req, res, next) {
  const start = Date.now();
  res.on("finish", () => {
    const time = Date.now() - start;
    console.info(
      `${req.method} ${req.originalUrl} took ${time / 1000} seconds ⌛⌛`,
    );
  });
  next();
}
// GET MULTER CONFIGS
export function getUploadStorageConfig() {
  const destination = function (req, file, cb) {
    cb(null, UPLOAD_DIR);
  };
  const filename = function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  };
  const multerDiskstorage = { destination, filename };
  const storage = multer.diskStorage(multerDiskstorage);
  const upload = multer({ storage });
  return upload.fields(UPLOAD_FIELDS);
}
