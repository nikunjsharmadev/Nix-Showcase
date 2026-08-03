import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'node:url';
import { App } from './app/index.js';
import { handleFatalError } from './app/utils/index.js';
import { PORT, HOSTNAME, PROCESS } from './app/constants/index.js';
// SERVER
async function Server() {
  const __DIRNAME = path.dirname(fileURLToPath(import.meta.url));
  try {
    const options = {
      key: fs.readFileSync(path.join(__DIRNAME, '../private.key')),
      cert: fs.readFileSync(path.join(__DIRNAME, '../certificate.crt')),
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
