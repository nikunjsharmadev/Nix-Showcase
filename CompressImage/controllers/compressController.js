const compressImage = async function (request, response) {
  try {
    const [file] = await compressImages(request.files);
    return response.status(201).json({});
  } catch (error) {
    return response.status.json({ status: "Fail", message: error.message });
  }
};

module.exports = {
  compressImage,
};
