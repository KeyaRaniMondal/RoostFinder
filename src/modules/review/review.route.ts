import express from "express";
import { reviewController } from "./review.controller";
import { auth } from "../../middlewares/auth";


const router = express.Router();

router.post("/", auth("Tenant"), reviewController.createReview);
router.get("/my-reviews", auth("Tenant"), reviewController.getMyReviews);
router.get("/property/:propertyId", reviewController.getReviewsForProperty);
router.delete("/:id", auth("Tenant"), reviewController.deleteReview);

export const reviewRoutes = router;