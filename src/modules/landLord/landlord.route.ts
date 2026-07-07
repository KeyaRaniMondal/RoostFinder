import express from "express";
import { auth } from "../../middlewares/auth";
import { landlordController } from "./landloed.controller";


const router = express.Router();

router.post("/", auth(), landlordController.createLandlordProfile);
router.get("/me", auth(), landlordController.getMyLandlordProfile);
router.patch("/me", auth(), landlordController.updateLandlordProfile);

export const landlordRoutes = router;