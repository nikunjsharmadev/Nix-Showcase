const { compressImages } = require("../utils/utils");
const compressImage = async function (request, response) {
  try {
    const [file] = await compressImages(request.files);
    return response
      .status(201)
      .json({ status: "Success", file: file.fileName });
  } catch (error) {
    return response
      .status(500)
      .json({ status: "Fail", message: error.message });
  }
};

module.exports = {
  compressImage,
};
