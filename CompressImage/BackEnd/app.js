const express = require("express");
const app = express();
const compressRoutes = require("./routes/compressRoutes");
const { UPLOAD_DIR } = require("./utils/utils");
app.use(express.json());
app.use("/compressed", express.static(UPLOAD_DIR));
app.use("/api", compressRoutes);
module.exports = app;
