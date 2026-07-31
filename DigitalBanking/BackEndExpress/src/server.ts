import https from 'https';
import fs from 'fs';
import { App } from './app/index.js';
import { handleFatalError } from './app/utils/index.js';
import { PORT, HOSTNAME, PROCESS } from './app/constants/index.js';
// SERVER
async function Server() {
  try {
    const options = {
      key: fs.readFileSync('./private.key'),
      cert: fs.readFileSync('./certificate.crt'),
    };
    const server = https.createServer(options, App());
    server.listen(PORT, HOSTNAME, () => {
      console.info(`server is up👍 and running🏃🏃 on:
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
