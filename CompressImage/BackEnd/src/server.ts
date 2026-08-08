import https from 'https';
import { appFactory } from './app/app.js';
import { utilFactory } from './app/utils/index.js';
import { constantFactory } from './app/consts/const.js';
import { socketFactory } from './app/sockets/socket.js';
import { queueFactory } from './app/queues/queue.js';
// SERVER
const ApiServer = async () => {
  try {
    const { HTTPS_CERTIFICATE_CONFIG, PORT, HOSTNAME, SERVER_RUN_MESSAGE } = constantFactory;
    const { setSocket, getSocket, socketEvents } = socketFactory;
    const { setQueue, setQueueEvent, monitorQueue } = queueFactory;
    const server = https.createServer(HTTPS_CERTIFICATE_CONFIG, appFactory);
    setSocket(server);
    socketEvents();
    setQueue('image-processing');
    setQueueEvent('image-processing');
    await monitorQueue(getSocket());
    server.listen(PORT, HOSTNAME, () => console.info(SERVER_RUN_MESSAGE));
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};
const { handleFatalError } = utilFactory;
process.on('uncaughtException', handleFatalError);
process.on('unhandledRejection', handleFatalError);
ApiServer().catch(handleFatalError);
