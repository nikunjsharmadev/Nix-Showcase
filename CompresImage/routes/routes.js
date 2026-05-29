const express = require("express");
const { compressImage } = require("../controllers/compressController");
const { asyncHandler } = require("../utils/utils");
router.get("/", (request, response) => {
  response.json({
    status: "compress server up and running",
  });
});

router.route("/compress").post(asyncHandler(compressImage));
