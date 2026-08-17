import { uploadBuffer } from "../../lib/cloudinary";

const uploadImages = async (files: Express.Multer.File[]) => {
  const uploaded = await Promise.all(
    files.map((file) => uploadBuffer(file.buffer, "properties"))
  );

  return uploaded.map((u) => ({ url: u.url, publicId: u.publicId }));
};

export const uploadsService = {
  uploadImages,
};
