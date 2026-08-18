import { utilFactory } from '../utils/index.js';
import { constantFactory } from '../consts/index.js';
import fs from 'fs';
import sharp from 'sharp';
import path from 'path';
import { ApiError } from '../models/model.js';
// SERVICES
const createServices = () => {
  const { UPLOAD_DIR } = constantFactory;
  const { getRandomName } = utilFactory;
  const compressMultipleFiles = async (files: Express.Multer.File[]) => {
    const allFiles = Object.values(files).filter(Boolean).flat();
    await fs.promises.mkdir(UPLOAD_DIR, { recursive: true });
    const compressPromises = allFiles.map((file) => {
      return compressSingleFile(file);
    });
    return compressPromises;
  };
  const compressSingleFile = async (file: Express.Multer.File) => {
    const fileName = `${Date.now()}${getRandomName(10)}.webp`;
    const originalSize = file.size;
    const outputPath = path.join(UPLOAD_DIR, fileName);
    return new Promise((resolve, reject) => {
      const readStream = fs.createReadStream(file.path);
      const writeStream = fs.createWriteStream(outputPath);
      const transform = sharp().resize(500).webp({ quality: 60 });
      readStream.on('error', reject);
      writeStream.on('error', reject);
      writeStream.on('finish', async () => {
        const stats = await fs.promises.stat(outputPath);
        const compressedSize = stats.size;
        await fs.promises.unlink(file.path).catch(() => {});
        resolve({
          fileName,
          originalSize,
          compressedSize,
          size: 'bytes',
        });
      });
      readStream.pipe(transform).pipe(writeStream);
    });
  };
  const compressImage = async (files: { images: Express.Multer.File[] }) => {
    if (!files.images?.length) throw new ApiError(400, 'no image uploaded');
    const promiseResponse = files['images'].length > 1 ? await compressMultipleFiles(files.images) : [await compressSingleFile(files['images'][0]!)];
    return Promise.all(promiseResponse);
  };
  return {
    compressMultipleFiles,
    compressSingleFile,
    compressImage,
  };
};
export const serviceFactory = createServices();
