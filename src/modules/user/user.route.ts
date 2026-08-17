import { Router } from "express";
import { userController } from "./user.controller";
import { Role } from "@prisma/client";
import { auth } from "../../middlewares/auth";
import { upload } from "../../lib/multer";
const router=Router()

router.post('/register',userController.registerUser)
router.get('/me',auth(Role.Tenant,Role.Landlord,Role.Admin),userController.getMyProfile)
router.patch('/me',auth(Role.Tenant,Role.Landlord,Role.Admin),userController.updateMyProfile)
router.patch(
	"/profile-image",
	auth(Role.Tenant,Role.Landlord,Role.Admin),
	upload.single("profileImage"),
	userController.uploadProfileImage,
);
export const userRoutes=router