// import { catchAsync } from "../../utils/catchAsync";
// import { Request, Response, NextFunction } from "express";
// import { sendResponse } from "../../utils/sendResponse";
// import httpStatus from "http-status";
// import { propertyService } from "./property.service";

// const createProperty = catchAsync(
//     async (req: Request, res: Response, next: NextFunction) => {
//         const landlordId = req.user?.id;
//         const payload = req.body;

//         const result = await propertyService.createProperty(
//             payload,
//             landlordId as string
//         );

//         sendResponse(res, {
//             success: true,
//             statusCode: httpStatus.CREATED,
//             message: "Property created successfully",
//             data: result,
//         });
//     }
// );

// export const propertyController = {
//     createProperty,
// };

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

export const propertyController = {
    createProperty,
};