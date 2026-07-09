import { catchAsync } from "../../utils/catchAsync";
import { Request, Response, NextFunction } from "express";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";
import { reviewService } from "./review.service";

const createReview = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const tenantId = req.user?.id;
        const { rentalRequestId, rating, comment } = req.body;

        const result = await reviewService.createReview(tenantId as string, {
            rentalRequestId,
            rating,
            comment,
        });

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.CREATED,
            message: "Review submitted successfully",
            data: result,
        });
    }
);

const getReviewsForProperty = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const { propertyId } = req.params;

        const result = await reviewService.getReviewsForProperty(propertyId as string);

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "Reviews retrieved successfully",
            data: result,
        });
    }
);

const getMyReviews = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const tenantId = req.user?.id;

        const result = await reviewService.getMyReviews(tenantId as string);

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "Your reviews retrieved successfully",
            data: result,
        });
    }
);

const deleteReview = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const tenantId = req.user?.id;
        const { id } = req.params;

        const result = await reviewService.deleteReview(tenantId as string, id as string);

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "Review deleted successfully",
            data: result,
        });
    }
);

export const reviewController = {
    createReview,
    getReviewsForProperty,
    getMyReviews,
    deleteReview,
};