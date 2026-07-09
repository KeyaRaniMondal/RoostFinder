import { Router } from "express";
import { userController } from "./user.controller";
import { Role } from "@prisma/client";
import { auth } from "../../middlewares/auth";
const router=Router()

router.post('/register',userController.registerUser)

router.get('/me',auth(Role.Tenant,Role.Landlord,Role.Admin),userController.getMyProfile)

export const userRoutes=router