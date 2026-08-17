import express from "express";
import { reviewController } from "./review.controller";
import { auth } from "../../middlewares/auth";
import { Role } from "@prisma/client";


const router = express.Router();

router.post("/", auth(Role.Tenant), reviewController.createReview);
router.get("/my-reviews", auth(Role.Tenant), reviewController.getMyReviews);
router.get("/property/:propertyId", reviewController.getReviewsForProperty);
router.delete("/:id", auth(Role.Tenant), reviewController.deleteReview);

export const reviewRoutes = router;