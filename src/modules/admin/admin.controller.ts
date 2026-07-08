import { catchAsync } from "../../utils/catchAsync";
import { Request, Response, NextFunction } from "express";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";
import { adminService } from "./admin.service";

const getAllUsers = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const result = await adminService.getAllUsers(req.query);

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "Users retrieved successfully",
            data: result.data,
            meta: result.meta,
        });
    }
);

const updateUserStatus = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;
        const { activeStatus } = req.body;
        const result = await adminService.updateUserStatus(id as string, activeStatus);

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: `User ${activeStatus === "BANNED" ? "banned" : "unbanned"} successfully`,
            data: result,
        });
    }
);

const getAllPropertiesAdmin = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const result = await adminService.getAllPropertiesAdmin(req.query);

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "Properties retrieved successfully",
            data: result.data,
            meta: result.meta,
        });
    }
);

const getAllRentalsAdmin = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const result = await adminService.getAllRentalsAdmin(req.query);

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "Rental requests retrieved successfully",
            data: result.data,
            meta: result.meta,
        });
    }
);

export const adminController = {
    getAllUsers,
    updateUserStatus,
    getAllPropertiesAdmin,
    getAllRentalsAdmin,
};