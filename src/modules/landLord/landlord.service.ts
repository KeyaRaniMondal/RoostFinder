import { prisma } from "../../lib/prisma";
import { ICreateLandlord, IUpdateLandlord } from "./landlord.interface";

const createLandlordProfile = async (
    userId: string,
    payload: ICreateLandlord
) => {
    const existing = await prisma.landlord.findUnique({
        where: { userId },
    });

    if (existing) {
        throw new Error("Landlord profile already exists for this user.");
    }

    const landlord = await prisma.landlord.create({
        data: {
            ...payload,
            userId,
        },
    });

    return landlord;
};

const getMyLandlordProfile = async (userId: string) => {
    const landlord = await prisma.landlord.findUnique({
        where: { userId },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                },
            },
        },
    });

    if (!landlord) {
        throw new Error("Landlord profile not found.");
    }

    return landlord;
};

const updateLandlordProfile = async (
    userId: string,
    payload: IUpdateLandlord
) => {
    const existing = await prisma.landlord.findUnique({
        where: { userId },
    });

    if (!existing) {
        throw new Error("Landlord profile not found. Create one first.");
    }

    const landlord = await prisma.landlord.update({
        where: { userId },
        data: payload,
    });

    return landlord;
};

const getRentalRequests = async (userId: string) => {
    const landlord = await prisma.landlord.findUnique({
        where: { userId },
    });

    if (!landlord) {
        throw new Error("Landlord profile not found.");
    }

    const requests = await prisma.rentalRequest.findMany({
        where: {
            property: {
                landlordId: landlord.id,
            },
        },
        include: {
            property: true,
            tenant: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
        },
        orderBy: { createdAt: "desc" },
    });

    return requests;
};

const updateRentalRequestStatus = async (
    userId: string,
    requestId: string,
    status: string
) => {
    const landlord = await prisma.landlord.findUnique({
        where: { userId },
    });

    if (!landlord) {
        throw new Error("Landlord profile not found.");
    }

    const request = await prisma.rentalRequest.findUnique({
        where: { id: requestId },
        include: {
            property: true,
        },
    });

    if (!request) {
        throw new Error("Rental request not found.");
    }

    if (request.property.landlordId !== landlord.id) {
        throw new Error("You are not authorized to manage this rental request.");
    }

    const normalizedStatus = String(status).toUpperCase();
    if (!["APPROVED", "REJECTED"].includes(normalizedStatus)) {
        throw new Error("Status must be APPROVED or REJECTED.");
    }

    const updatedRequest = await prisma.rentalRequest.update({
        where: { id: requestId },
        data: {
            status: normalizedStatus as any,
        },
    });

    return updatedRequest;
};

export const landlordService = {
    createLandlordProfile,
    getMyLandlordProfile,
    updateLandlordProfile,
    getRentalRequests,
    updateRentalRequestStatus,
};