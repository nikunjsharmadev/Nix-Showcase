import { Queue } from 'bullmq';
//QUEUES
export const QueueFactory = () => {
  const imageQueue = () => {
    console.log("calling from queue")
    return new Queue('compress-image', {
      connection: {
        host: 'redis',
        port: 6379,
      },
    });
  };
  return {
    imageQueue,
  };
};
