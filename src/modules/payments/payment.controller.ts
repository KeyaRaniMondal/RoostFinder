import { catchAsync } from "../../utils/catchAsync";
import { Request, Response, NextFunction } from "express";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";
import { paymentService } from "./payment.service";

const createPaymentSession = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const tenantId = req.user?.id;
        const { rentalRequestId } = req.body;

        const result = await paymentService.createPaymentSession(tenantId as string, {
            rentalRequestId,
        });

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.CREATED,
            message: "Payment session created successfully",
            data: result,
        });
    }
);

// Manual confirm endpoint
const confirmPayment = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const { stripeSessionId } = req.body;

        const result = await paymentService.confirmPayment(stripeSessionId);

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "Payment status verified",
            data: result,
        });
    }
);


const getMyPayments = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const tenantId = req.user?.id;

        const result = await paymentService.getMyPayments(tenantId as string);

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "Payment history retrieved successfully",
            data: result,
        });
    }
);

const getSinglePayment = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const tenantId = req.user?.id;
        const { id } = req.params;

        const result = await paymentService.getSinglePayment(tenantId as string, id as string);

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "Payment details retrieved successfully",
            data: result,
        });
    }
);

export const paymentController = {
    createPaymentSession,
    confirmPayment,
    getMyPayments,
    getSinglePayment,
};