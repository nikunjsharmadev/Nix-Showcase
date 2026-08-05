import { ApiError, getRandomName } from '../utils/index.js';
import { UPLOAD_DIR } from '../consts/index.js';
import fs from 'fs';
import sharp from 'sharp';
import path from 'path';
export async function compressMultipleFiles(files: Express.Multer.File[]) {
  const allFiles = Object.values(files).filter(Boolean).flat();
  await fs.promises.mkdir(UPLOAD_DIR, { recursive: true });
  const compressPromises = allFiles.map((file) => {
    return compressSingleFile(file);
  });
  return compressPromises;
}
export async function compressSingleFile(file: Express.Multer.File) {
  const fileName = `${Date.now()}${getRandomName(10)}.webp`;
  const outputPath = path.join(UPLOAD_DIR, fileName);
  return new Promise((resolve, reject) => {
    const readStream = fs.createReadStream(file.path);
    const writeStream = fs.createWriteStream(outputPath);
    const transform = sharp().resize(500).webp({ quality: 75 });
    readStream.on('error', reject);
    writeStream.on('error', reject);
    writeStream.on('finish', async () => {
      await fs.promises.unlink(file.path).catch(() => {});
      resolve({
        fileName,
      });
    });
    readStream.pipe(transform).pipe(writeStream);
  });
}
export async function compressImage(files: { images: Express.Multer.File[] }) {
  if (!files.images?.length) throw new ApiError(400, 'no image uploaded');
  const promiseResponse = files['images'].length > 1 ? await compressMultipleFiles(files.images) : [await compressSingleFile(files['images'][0]!)];
  return Promise.all(promiseResponse);
}
