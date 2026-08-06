import https from 'https';
import { App } from './app/app.js';
import { handleFatalError } from './app/utils/util.js';
import { PORT, HOSTNAME, PROCESS, SERVERCONFIGS } from './app/constants/const.js';
// SERVER
async function Server() {
  try {
    const server = https.createServer(SERVERCONFIGS, App());
    server.listen(PORT, HOSTNAME, () => {
      console.info(`server is up👍 and running 🏃🏃 on:
        Url: https://${HOSTNAME}:${PORT}`);
    });
  } catch (err) {
    console.error(err);
    PROCESS.exit(1);
  }
}
Server().catch(handleFatalError);
PROCESS.on('uncaughtException', handleFatalError);
PROCESS.on('unhandledRejection', handleFatalError);
