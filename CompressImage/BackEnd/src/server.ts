import https from 'https';
import fs from 'fs';
import path from 'path';
import { App } from './app/app.js';
import { Utils } from './app/utils/index.js';
import { HOSTNAME, PORT, PROCESS } from './app/consts/const.js';
// SERVER
const Server = async () => {
  try {
    const options = {
      key: fs.readFileSync(path.join(PROCESS.cwd(), 'certs', 'private.key')),
      cert: fs.readFileSync(path.join(PROCESS.cwd(), 'certs', 'certificate.crt')),
    };
    const server = https.createServer(options, App());
    server.listen(PORT, HOSTNAME, () => {
      console.info(`server is up👍 and running🏃🏃 on:
        Url: https://${HOSTNAME}:${PORT}`);
    });
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};
Server().catch(Utils().handleFatalError);
process.on('uncaughtException', Utils().handleFatalError);
process.on('unhandledRejection', Utils().handleFatalError);
