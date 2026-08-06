import fs from 'fs/promises';
import { Worker } from 'bullmq';
import { Services } from '../services/service.js';
import { UPLOAD_DIR } from '../consts/const.js';
// WORKERS
export const WorkersFactory = () => {
  const imageWorker = () => {
    return new Worker(
      'compress-image',
      async (job) => {
        const service = Services;
        const files = job.data.files;
        await fs.mkdir(UPLOAD_DIR!, { recursive: true });
        await service().compressImage(files as { images: Express.Multer.File[] });
      },
      {
        connection: {
          host: 'redis',
          port: 6379,
        },
      },
    );
  };
  return {
    imageWorker,
  };
};
WorkersFactory().imageWorker();
WorkersFactory()
  .imageWorker()
  .on('completed', (job) => {
    console.log(`Job ${job.id} completed`);
  });
WorkersFactory()
  .imageWorker()
  .on('failed', (job, err) => {
    console.log(`Job ${job?.id} failed`, err);
  });
