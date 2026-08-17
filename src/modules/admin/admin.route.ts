import express from "express";
import { adminController } from "./admin.controller";
import { auth } from "../../middlewares/auth";
import { Role } from "@prisma/client";

const router = express.Router();

router.get("/users", auth(Role.Admin), adminController.getAllUsers);
router.patch("/users/:id", auth(Role.Admin), adminController.updateUserStatus);
router.get("/properties", auth(Role.Admin), adminController.getAllPropertiesAdmin);
router.get("/rentals", auth(Role.Admin), adminController.getAllRentalsAdmin);

export const adminRoutes = router;