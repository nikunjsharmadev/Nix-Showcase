import type { NextFunction, Request, Response } from 'express';
import { queueFactory } from '../queues/queue.js';
import { ApiError } from '../models/model.js';
// CONTROLLER
const createController = () => {
  const compressImage = async (req: Request, res: Response, _: NextFunction): Promise<void> => {
    if (!req.files) throw new ApiError(400, 'no file selected');
    const { getQueue } = queueFactory;
    const job = await getQueue().add('compress-image', {
      files: req.files as { images: Express.Multer.File[] },
      userId: req.body.userId,
    });
    res.status(200).json({
      seccess: true,
      message: 'Image uploaded successfully',
      jobId: job.id,
    });
  };
  return { compressImage };
};
export const controllerFactory = createController();
