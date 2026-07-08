import { compressImage } from "../services/index.js";
import { ApiError } from "../utils/index.js";
export async function CompressImageController(req, res) {
  try {
    const data = await compressImage(req.files.images);
    return res.status(200).json({
      seccess: true,
      message: "Image compressed Successfully",
      data: [data],
    });
  } catch (e) {
    throw new ApiError(e.message);
  }
}
