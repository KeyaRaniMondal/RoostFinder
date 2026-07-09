import { prisma } from "../../lib/prisma";
import { ICreateReview } from "./review.interface";

const createReview = async (tenantId: string, payload: ICreateReview) => {
    const { rentalRequestId, rating, comment } = payload;

    if (rating < 1 || rating > 5) {
        throw new Error("Rating must be between 1 and 5");
    }

    const rentalRequest = await prisma.rentalRequest.findUnique({
        where: { id: rentalRequestId },
    });

    if (!rentalRequest) {
        throw new Error("Rental request not found");
    }

    if (rentalRequest.tenantId !== tenantId) {
        throw new Error("You are not authorized to review this rental");
    }

    if (rentalRequest.status !== "COMPLETED") {
        throw new Error("You can only review a rental after it has been completed");
    }

    const existingReview = await prisma.review.findUnique({
        where: { rentalRequestId },
    });

    if (existingReview) {
        throw new Error("You have already reviewed this rental");
    }

    const review = await prisma.review.create({
        data: {
            rating,
            comment,
            tenantId,
            propertyId: rentalRequest.propertyId,
            rentalRequestId,
        },
    });

    return review;
};

const getReviewsForProperty = async (propertyId: string) => {
    const reviews = await prisma.review.findMany({
        where: { propertyId },
        include: { tenant: { select: { id: true, name: true } } },
        orderBy: { createdAt: "desc" },
    });

    return reviews;
};

const getMyReviews = async (tenantId: string) => {
    const reviews = await prisma.review.findMany({
        where: { tenantId },
        include: { property: true },
        orderBy: { createdAt: "desc" },
    });

    return reviews;
};

const deleteReview = async (tenantId: string, id: string) => {
    const review = await prisma.review.findUnique({ where: { id } });

    if (!review) {
        throw new Error("Review not found");
    }

    if (review.tenantId !== tenantId) {
        throw new Error("You are not authorized to delete this review");
    }

    await prisma.review.delete({ where: { id } });

    return review;
};

export const reviewService = {
    createReview,
    getReviewsForProperty,
    getMyReviews,
    deleteReview,
};