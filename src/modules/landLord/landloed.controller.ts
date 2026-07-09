import { catchAsync } from "../../utils/catchAsync";
import { Request, Response, NextFunction } from "express";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";
import { landlordService } from "./landlord.service";

const createLandlordProfile = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const userId = req.user?.id;
        const payload = req.body;

        const result = await landlordService.createLandlordProfile(
            userId as string,
            payload
        );

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.CREATED,
            message: "Landlord profile created successfully",
            data: result,
        });
    }
);

const getMyLandlordProfile = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const userId = req.user?.id;

        const result = await landlordService.getMyLandlordProfile(
            userId as string
        );

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "Landlord profile retrieved successfully",
            data: result,
        });
    }
);

const updateLandlordProfile = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const userId = req.user?.id;
        const payload = req.body;

        const result = await landlordService.updateLandlordProfile(
            userId as string,
            payload
        );

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "Landlord profile updated successfully",
            data: result,
        });
    }
);

const getLandlordRequests = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const userId = req.user?.id;

        const result = await landlordService.getRentalRequests(
            userId as string
        );

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "Rental requests retrieved successfully",
            data: result,
        });
    }
);

const updateRentalRequestStatus = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const userId = req.user?.id;
        const { id } = req.params;
        const { status } = req.body;

        const result = await landlordService.updateRentalRequestStatus(
            userId as string,
            id as string,
            status as string
        );

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "Rental request status updated successfully",
            data: result,
        });
    }
);

export const landlordController = {
    createLandlordProfile,
    getMyLandlordProfile,
    updateLandlordProfile,
    getLandlordRequests,
    updateRentalRequestStatus,
};