import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { uploadsService } from "./uploads.service";

const uploadImages = catchAsync(async (req: Request, res: Response) => {
  const files = (req.files as Express.Multer.File[] | undefined) ?? [];

  if (files.length === 0) {
    throw new Error("No files uploaded");
  }

  const images = await uploadsService.uploadImages(files);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Images uploaded successfully",
    data: { images },
  });
});

export const uploadsController = {
  uploadImages,
};
