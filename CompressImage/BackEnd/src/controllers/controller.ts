import type { Request, Response } from 'express';
import { compressImage } from '../services/index.js';
import { ApiError } from '../utils/util.js';
export async function CompressImageController(req: Request, res: Response): Promise<void> {
  if (!req.files) throw new ApiError(400, 'no file selected');
  const data = await compressImage(req.files as { images: Express.Multer.File[] });
  res.status(200).json({
    seccess: true,
    message: 'Image compressed Successfully',
    data: [data],
  });
}
