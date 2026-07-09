import { Router } from 'express'
import { auth } from '../../middlewares/auth.js';
import { Role } from '../../../prisma/generated/prisma/client.js';
import { propertyController } from './property.controller.js';

const router = Router();

router.post("/", auth(Role.Landlord, Role.Admin), propertyController.createProperty);
router.get('/', propertyController.getAllProperties);
router.get('/:id', propertyController.getPropertyById);
router.put("/:id", auth(Role.Landlord, Role.Admin), propertyController.updateProperty);
router.delete("/:id", auth(Role.Landlord, Role.Admin), propertyController.deleteProperty);
export const propertyRoutes = router;