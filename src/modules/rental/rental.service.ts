import { prisma } from "../../lib/prisma";
import { IrentalRequest } from "./rental.interface";

const createRentalRequest = async (tenantId: string, payload: IrentalRequest) => {
    const property = await prisma.property.findUnique({
        where: { id: payload.propertyId },
    });

    if (!property) {
        throw new Error("Property not found");
    }

    // Prevent from "renting" their own property, and duplicate pending requests
    const existing = await prisma.rentalRequest.findFirst({
        where: {
            propertyId: payload.propertyId,
            tenantId,
            status: "PENDING",
        },
    });

    if (existing) {
        throw new Error("You already have a pending request for this property");
    }

    const rentalRequest = await prisma.rentalRequest.create({
        data: {
            propertyId: payload.propertyId,
            tenantId,
            message: payload.message,
            moveInDate: payload.move_in_date ? new Date(payload.move_in_date) : undefined,
        },
    });

    return rentalRequest;
};





export const rentalService = {
    createRentalRequest
};