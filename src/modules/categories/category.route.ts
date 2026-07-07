import express from "express";
import { categoryController } from "./category.controller";

const router = express.Router();

router.get("/", categoryController.getAllCategories);

export const categoryRoutes = router;