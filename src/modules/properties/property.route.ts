import { Router } from 'express'
import { auth } from '../../middlewares/auth';
import { Role } from '../../../prisma/generated/prisma/client';
import { propertyController } from './property.controller';

const router = Router();

router.post("/createProperty", auth(Role.Tenant, Role.Landlord, Role.Admin), propertyController.createProperty
);

router.get('/getProperty', propertyController.getAllProperties);

router.get('/getProperty/:id', propertyController.getPropertyById);
export const propertyRoutes = router;