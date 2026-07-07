import { prisma } from "../../lib/prisma";
import { IrentalRequest } from "./rental.interface";

//ceate a rental request
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

//get all rental requests for a tenant
const getMyRentalRequests = async (tenantId: string) => {
    const requests = await prisma.rentalRequest.findMany({
        where: { tenantId },
        include: {
            property: true,
        },
        orderBy: { createdAt: "desc" },
    });

    return requests;
};

//rental request details
const getSingleRentalRequestDetails = async (tenantId: string, id: string) => {
    const request = await prisma.rentalRequest.findUnique({
        where: { id },
        include: {
            property: {
                include: { landlord: true },
            },
        },
    });

    if (!request) {
        throw new Error("Rental request not found");
    }

    // the tenant can only view own request
    if (request.tenantId !== tenantId) {
        throw new Error("You are not authorized to view this rental request");
    }

    return request;
};

export const rentalService = {
    createRentalRequest,
    getMyRentalRequests,
    getSingleRentalRequestDetails
};