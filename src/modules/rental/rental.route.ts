import express from "express";
import { rentalController } from "./rental.controller";
import { auth } from "../../middlewares/auth";

const router = express.Router();

router.post("/", auth(), rentalController.createRentalRequest);


export const rentalRoutes = router;