const express = require("express");
const multer = require("multer");

const { compressImage } = require("../controllers/compressController");
const { asyncHandler, storage, uploadFields } = require("../utils/utils");
const router = express.Router();
const upload = multer({ storage });

//Health check...
router.get("/", (request, response) => {
  response.json({
    status: "compress  server up and running",
  });
});

router
  .route("/image")
  .post(upload.fields(uploadFields), asyncHandler(compressImage));
module.exports = router;
