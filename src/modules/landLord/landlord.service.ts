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

export const landlordService = {
    createLandlordProfile,
    getMyLandlordProfile,
    updateLandlordProfile,
};