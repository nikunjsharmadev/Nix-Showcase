import dotenv from "dotenv";
import http from "node:http";
import { handleFatalError } from "./src/utils/index.js";
import App from "./src/app.js";
export async function Server() {
  try {
    dotenv.config();
    const env = process.env;
    const hostName = env.ENV === "dev" ? env.DEV_HOST : env.PROD_HOST;
    const port = env.PORT || 3000;
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
process.on("uncaughtException", handleFatalError);
process.on("unhandledRejection", handleFatalError);
