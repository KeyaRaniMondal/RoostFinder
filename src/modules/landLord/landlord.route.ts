import express from "express";
import { auth } from "../../middlewares/auth";
import { Role } from "@prisma/client";
import { landlordController } from "./landloed.controller";
import { propertyRoutes } from "../properties/property.route";

const router = express.Router();

router.post("/", auth(), landlordController.createLandlordProfile);
router.get("/me", auth(), landlordController.getMyLandlordProfile);
router.patch("/me", auth(), landlordController.updateLandlordProfile);

router.use("/properties", propertyRoutes);

router.get("/requests", auth(Role.Landlord, Role.Admin), landlordController.getLandlordRequests);
router.patch("/requests/:id", auth(Role.Landlord, Role.Admin), landlordController.updateRentalRequestStatus);

export const landlordRoutes = router;