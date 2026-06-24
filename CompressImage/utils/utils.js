const multer = require("multer");
const path = require("path");
const fs = require("fs");
const sharp = require("sharp");
const UPLOAD_DIR = path.join(__dirname, process.env.UPLOAD_PATH);

const CHAR_SET = "abcdefghijklmnopqrstuvwxyz";

const getRandom = (function () {
  let randomName = function (length = 5) {
    try {
      const chars = Array.from(
        { length },
        () => CHAR_SET[Math.floor(Math.random() * CHAR_SET.length)],
      );
      return makeFirstCharCapital(chars.join(""));
    } catch (error) {
      throw error;
    }
  };
  return { randomName };
})();

const makeFirstCharCapital = function (str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
};
const destination = function (req, file, cb) {
  cb(null, UPLOAD_DIR);
};

const filename = function (req, file, cb) {
  cb(null, `${Date.now()}-${file.originalname}`);
};

const multerDiskstorage = { destination, filename };
const storage = multer.diskStorage(multerDiskstorage);
const uploadFields = [
  {
    name: "images",
    maxCount: Number(process.env.MAX_IMAGE_UPLOAD_COUNT),
  },
  {
    name: "videos",
    maxCount: Number(process.env.MAX_VIDEO_UPLOAD_COUNT),
  },
  {
    name: "documents",
    maxCount: Number(process.env.MAX_DOCUMENT_UPLOAD_COUNT),
  },
];
const compressImages = async function (files) {
  try {
    const allFiles = Object.values(files).filter(Boolean).flat();
    await fs.promises.mkdir(UPLOAD_DIR, { recursive: true });
    const compressPromises = allFiles.map((file) => {
      return compressSingle(file);
    });
    return Promise.all(compressPromises);
  } catch (error) {
    throw error;
  }
};

const compressSingle = async function (file) {
  const fileName = `${Date.now()}${getRandom.randomName(10)}.webp`;
  const outputPath = path.join(UPLOAD_DIR, fileName);
  return new Promise((resolve, reject) => {
    const readStream = fs.createReadStream(file.path);
    const writeStream = fs.createWriteStream(outputPath);
    const transform = sharp().resize(500).webp({ quality: 75 });
    readStream.on("error", reject);
    writeStream.on("error", reject);
    writeStream.on("finish", async () => {
      await fs.promises.unlink(file.path).catch(() => {});
      resolve({
        fileName,
      });
    });
    readStream.pipe(transform).pipe(writeStream);
  });
};

const asyncHandler = function (fn) {
  return function (req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  UPLOAD_DIR,
  storage,
  compressImages,
  asyncHandler,
  uploadFields,
};
