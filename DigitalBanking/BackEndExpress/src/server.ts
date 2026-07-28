import http from 'node:http';
import { App } from './app/index.js';
import { handleFatalError } from './app/utils/index.js';
import { PORT, HOSTNAME, PROCESS } from './app/constants/index.js';
// SERVER
async function Server() {
  try {
    const server = http.createServer(App());
    server.listen(PORT, HOSTNAME, () => {
      console.info(`server is up👍 and running🏃🏃 on:
        Url: http://${HOSTNAME}:${PORT}`);
    });
  } catch (err) {
    console.error(err);
    PROCESS.exit(1);
  }
}
Server().catch(handleFatalError);
PROCESS.on('uncaughtException', handleFatalError);
PROCESS.on('unhandledRejection', handleFatalError);
