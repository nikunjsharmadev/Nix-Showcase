import dotenv from 'dotenv';
dotenv.config();
import http from 'node:http';
import { App } from './app/index.js';
import { handleFatalError } from './app/utils/index.js';
// SERVER
async function Server() {
  try {
    dotenv.config();
    const env = process.env;
    const hostName: string = env.ENV === 'dev' ? env.DEV_HOST! : env.PROD_HOST!;
    const port = Number(env.PORT || 3000);
    const server = http.createServer(App());
    server.listen(port, hostName, () => {
      console.info(`server is up👍 and running🏃🏃 on:
        Url: http://${hostName}:${port}`);
    });
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
Server().catch(handleFatalError);
process.on('uncaughtException', handleFatalError);
process.on('unhandledRejection', handleFatalError);
