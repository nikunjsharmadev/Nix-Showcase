import { Worker } from 'bullmq';
import { serviceFactory } from '../services/service.js';
import { constantFactory } from '../consts/const.js';
import fsp from 'fs/promises';
// WORKERS
const createWorker = () => {
  const { REDIS_CONNECTION, UPLOAD_DIR } = constantFactory;
  let worker: Worker;
  const setWorker = (workerName: string) => {
    console.info(`worker has been started with: ${workerName}`);
    worker = new Worker(
      workerName,
      async (job) => {
        try {
          const { compressImage } = serviceFactory;
          const files = job.data.files;
          await job.updateProgress(10);
          await job.updateProgress(30);
          await fsp.mkdir(UPLOAD_DIR!, { recursive: true });
          const data = await compressImage(files as { images: Express.Multer.File[] });
          await job.updateProgress(60);
          await job.updateProgress(100);
          return data;
        } catch (error) {
          throw error;
        }
      },
      REDIS_CONNECTION,
    );
  };
  const getWorker = () => worker;
  const workerEvents = () => {
    worker.on('completed', (job) => {
      console.info(`Job ${job.id} completed`);
    });
    worker.on('failed', (job, err) => {
      console.info(`Job ${job?.id} failed`, err);
    });
  };
  return { setWorker, getWorker, workerEvents };
};
export const workerFactory = createWorker();
const { setWorker, workerEvents } = workerFactory;
setWorker('image-processing');
workerEvents();
