import express from "express";
import { paymentController } from "./payment.controller";
import { auth } from "../../middlewares/auth";

const router = express.Router();

router.post("/create", auth(), paymentController.createPaymentSession);
router.post("/confirm", auth(), paymentController.confirmPayment);
router.get("/", auth(), paymentController.getMyPayments);
router.get("/:id", auth(), paymentController.getSinglePayment);

export const paymentRoutes = router;