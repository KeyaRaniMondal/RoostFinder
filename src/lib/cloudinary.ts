import { v2 as cloudinary } from "cloudinary";
import config from "../config/index";

cloudinary.config({
  cloud_name: config.cloudinary_cloud_name,
  api_key: config.cloudinary_api_key,
  api_secret: config.cloudinary_api_secret,
});

export interface CloudinaryUpload {
  url: string;
  publicId: string;
}

export const uploadBuffer = (
  buffer: Buffer,
  folder: string
): Promise<CloudinaryUpload> =>
  new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          resource_type: "auto",
          folder,
        },
        (error, result) => {
          if (error) return reject(error);
          if (!result) return reject(new Error("No result returned from Cloudinary"));
          resolve({ url: result.secure_url, publicId: result.public_id });
        }
      )
      .end(buffer);
  });

export default cloudinary;
