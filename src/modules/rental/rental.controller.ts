
import { catchAsync } from "../../utils/catchAsync";
import { Request, Response, NextFunction } from "express";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";
import { rentalService } from "./rental.service";

const createRentalRequest = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const tenantId = req.user?.id;
        const payload = req.body;

        const result = await rentalService.createRentalRequest(
            tenantId as string,
            payload
        );

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.CREATED,
            message: "Rental request submitted successfully",
            data: result,
        });
    }
);



export const rentalController = {
    createRentalRequest
};