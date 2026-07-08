import express from "express";
import { adminController } from "./admin.controller";
import { auth } from "../../middlewares/auth";

const router = express.Router();

router.get("/users", auth("Admin"), adminController.getAllUsers);
router.patch("/users/:id", auth("Admin"), adminController.updateUserStatus);
router.get("/properties", auth("Admin"), adminController.getAllPropertiesAdmin);
router.get("/rentals", auth("Admin"), adminController.getAllRentalsAdmin);

export const adminRoutes = router;