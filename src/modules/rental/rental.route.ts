import express from "express";
import { rentalController } from "./rental.controller";
import { auth } from "../../middlewares/auth";

const router = express.Router();

router.post("/", auth(), rentalController.createRentalRequest);
router.get("/", auth(), rentalController.getMyRentalRequests);
router.get("/:id", auth(), rentalController.getSingleRentalRequestDetails);

export const rentalRoutes = router;