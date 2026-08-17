import { Router } from "express";
import { Role } from "@prisma/client";
import { auth } from "../../middlewares/auth";
import { upload } from "../../lib/multer";
import { uploadsController } from "./uploads.controller";

const router = Router();

router.post(
  "/",
  auth(Role.Landlord, Role.Admin),
  upload.array("images", 6),
  uploadsController.uploadImages
);

export const uploadsRoutes = router;
