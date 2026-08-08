import { Queue, QueueEvents } from 'bullmq';
import type { Server } from 'socket.io';
import { constantFactory } from '../consts/const.js';
//QUEUES
const createQueue = () => {
  const { REDIS_CONNECTION } = constantFactory;
  let queue: Queue;
  let queueEvents: QueueEvents;
  const setQueue = (queueName: string) => {
    queue = new Queue(queueName, REDIS_CONNECTION);
  };
  const setQueueEvent = (queueName: string) => {
    queueEvents = new QueueEvents(queueName, REDIS_CONNECTION);
  };
  const monitorQueue = async (io: Server) => {
    await queueEvents.waitUntilReady();
    queueEvents.on('progress', async ({ jobId, data }) => {
      const job = await queue.getJob(jobId);
      if (!job) return;
      io.to(job.data.userId).emit('image-progress', {
        data,
      });
    });
    queueEvents.on('completed', async ({ jobId }) => {
      const job = await queue.getJob(jobId);
      if (!job) return;
      io.to(job.data.userId).emit('image-completed', job.returnvalue);
    });
  };
  const getQueue = () => queue;
  const getQueueEvents = () => queueEvents;
  return {
    setQueue,
    getQueue,
    setQueueEvent,
    getQueueEvents,
    monitorQueue,
  };
};
export const queueFactory = createQueue();
