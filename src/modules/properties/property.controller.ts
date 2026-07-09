
import { catchAsync } from "../../utils/catchAsync";
import { Request, Response, NextFunction } from "express";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";
import { propertyService } from "./property.service";

const createProperty = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const userId = req.user?.id;
        const payload = req.body;

        const result = await propertyService.createProperty(
            payload,
            userId as string
        );

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.CREATED,
            message: "Property created successfully",
            data: result,
        });
    }
);

//get all property
const getAllProperties = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const query = req.query;

        const result = await propertyService.getAllProperties(query);

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "Properties retrieved successfully",
            data: result.data,
            meta: result.meta,
        });
    }
);


//get property by id
const getPropertyById = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params as { id: string }; // reads from URL, not req.body

        const result = await propertyService.getPropertyById(id);

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "Property retrieved successfully",
            data: result,
        });
    }
);

const updateProperty = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const userId = req.user?.id;
        const role = req.user?.role;
        const { id } = req.params as { id: string };
        const payload = req.body;

        const result = await propertyService.updateProperty(
            id,
            payload,
            userId as string,
            role as any
        );

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "Property updated successfully",
            data: result,
        });
    }
);

const deleteProperty = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const userId = req.user?.id;
        const role = req.user?.role;
        const { id } = req.params as { id: string };

        const result = await propertyService.deleteProperty(
            id,
            userId as string,
            role as any
        );

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "Property deleted successfully",
            data: result,
        });
    }
);

export const propertyController = {
    createProperty,
    getAllProperties,
    getPropertyById,
    updateProperty,
    deleteProperty
};