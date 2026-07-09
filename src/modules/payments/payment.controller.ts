import { catchAsync } from "../../utils/catchAsync";
import { Request, Response, NextFunction } from "express";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";
import { paymentService } from "./payment.service";
import { stripe } from "../../lib/stripe";
import config from "../../config";

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

// Actual Stripe webhook — separate route, uses raw body + signature verification
const stripeWebhook = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const sig = req.headers["stripe-signature"] as string;
        let event;

        try {
            event = stripe.webhooks.constructEvent(
                req.body, // must be raw buffer — see route setup below
                sig,
                config.STRIPE_WEBHOOK_SECRET as string
            );
        } catch (err: any) {
            return res.status(400).send(`Webhook Error: ${err.message}`);
        }

        await paymentService.handleWebhookEvent(event);

        res.json({ received: true });
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
    stripeWebhook ,
    confirmPayment,
    getMyPayments,
    getSinglePayment,
};