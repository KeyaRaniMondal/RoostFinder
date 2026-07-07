import { catchAsync } from "../../utils/catchAsync";
import { Request, Response, NextFunction } from "express";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";
import { categoryService } from "./category.service";

const getAllCategories = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const result = await categoryService.getAllCategories();

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "Categories retrieved successfully",
            data: result,
        });
    }
);

export const categoryController = {
    getAllCategories,
};