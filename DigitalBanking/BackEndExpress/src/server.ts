import dotenv from "dotenv";
dotenv.config();
import express from "express";
import { bankApi } from "./banking-portal/app.js";
const hostName = "0.0.0.0";
const port = process.env.PORT || 3000;
const mainApp = express();
mainApp.use(express.json());
mainApp.use((request, response, next) => {
  const start = Date.now();
  response.on("finish", () => {
    const time = Date.now() - start;
    console.log(`${request.method} ${request.url} - ${time}ms`);
  });
  next();
});
mainApp.use("/bnk/v1", bankApi);
mainApp.get("/", (request, response) => {
  response.json({
    message: "Main Server is up and running",
  });
});
mainApp.listen(port, () => {
  console.log(`Server running at http://${hostName}:${port}/`);
});
