import { Worker } from 'bullmq';
import { serviceFactory } from '../services/service.js';
import { constantFactory } from '../consts/const.js';
// WORKERS
const createWorker = () => {
  const { REDIS_CONNECTION } = constantFactory;
  let worker: Worker;
  const setWorker = (workerName: string) => {
    worker = new Worker(
      workerName,
      async (job) => {
        const { compressImage } = serviceFactory;
        const files = job.data.files;
        await job.updateProgress(10);
        await job.updateProgress(30);
        const data = await compressImage(files as { images: Express.Multer.File[] });
        await job.updateProgress(60);
        await job.updateProgress(100);
        return data;
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
