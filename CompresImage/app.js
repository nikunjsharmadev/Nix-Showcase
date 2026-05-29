const express = require("express");
const app = express();
const { UPLOAD_DIR } = require("");
app.use(express.json());
app.use("/compress", compressImageRoutes);
module.exports = app;
