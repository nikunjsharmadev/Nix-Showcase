import type { NextFunction, Request, Response } from 'express';
import { QueueFactory } from '../queues/queue.js';
import { ApiError } from '../models/model.js';
import { Services } from '../services/service.js';
// CONTROLLER
export const Controllers = () => {
  const serviceFactory = Services;
  const queueFactory = QueueFactory;
  const compressImage = async (req: Request, res: Response, _: NextFunction): Promise<void> => {
    if (!req.files) throw new ApiError(400, 'no file selected');
    await queueFactory()
      .imageQueue()
      .add('compress-image', {
        files: req.files as { images: Express.Multer.File[] },
      });
    // const data = await serviceFactory().compressImage(req.files as { images: Express.Multer.File[] });
    res.status(200).json({
      seccess: true,
      message: 'Image compressed Successfully',
      // data: [data],
    });
  };
  return { compressImage };
};
