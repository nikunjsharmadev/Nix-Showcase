require("dotenv").config();
const hostName = "0.0.0.0";
const port = process.env.PORT || 3000;
const express = require("express");
const mainApp = express();
mainApp.use(express.json());
mainApp.use(express.static("FrontEnd"));
mainApp.use((request, response, next) => {
  const start = Date.now();
  response.on("finish", () => {
    const time = Date.now() - start;
    console.log(`${request.method} ${request.url} - ${time}ms`);
  });
  next();
});

const compress = require("./BackEnd/app");
mainApp.use("/compress", compress);

mainApp.get("/", (request, response) => {
  response.json({
    status: "Main server has been started...",
  });
});
mainApp.listen(port, hostName, () => {
  console.log(`Server running at http://${hostName}:${port}/`);
});
