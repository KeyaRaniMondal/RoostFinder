
import { catchAsync } from "../../utils/catchAsync";
import { Request, Response, NextFunction } from "express";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";
import { rentalService } from "./rental.service";

//create rental request
const createRentalRequest = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const tenantId = req.user?.id;
        const payload = req.body;

        if (!tenantId || Array.isArray(tenantId)) {
            return next(new Error("Tenant id is required"));
        }

        const result = await rentalService.createRentalRequest(
            tenantId,
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

//get all rental requests for a tenant
const getMyRentalRequests = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const tenantId = req.user?.id;

        if (!tenantId || Array.isArray(tenantId)) {
            return next(new Error("Tenant id is required"));
        }

        const result = await rentalService.getMyRentalRequests(tenantId);

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "Rental requests retrieved successfully",
            data: result,
        });
    }
);

//rental request details
const getSingleRentalRequestDetails = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const tenantId = req.user?.id;
        const { id } = req.params;

        if (!tenantId || Array.isArray(tenantId)) {
            return next(new Error("Tenant id is required"));
        }

        if (!id || Array.isArray(id)) {
            return next(new Error("Rental request id is required"));
        }

        const result = await rentalService.getSingleRentalRequestDetails(
            tenantId,
            id
        );

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "Rental request retrieved successfully",
            data: result,
        });
    }
);

export const rentalController = {
    createRentalRequest,
    getMyRentalRequests,
    getSingleRentalRequestDetails
};