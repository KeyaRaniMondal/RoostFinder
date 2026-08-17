import { NextFunction, Request, RequestHandler, Response } from "express";
import httpStatus from "http-status";

export const catchAsync = (fn: RequestHandler) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            await fn(req, res, next);
        } catch (error) {
            console.log(error);

            const statusCode = (error as any).statusCode || httpStatus.INTERNAL_SERVER_ERROR;
            const message = (error as Error).message || "Internal Server Error";

            res.status(statusCode).json({
                success: false,
                statusCode,
                message,
                error: (error as Error).message
            })
        }
    }
}