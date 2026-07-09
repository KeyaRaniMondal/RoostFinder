import httpStatus from "http-status";
import { Request, Response, NextFunction } from "express";
import { prisma } from "../../lib/prisma";
import { catchAsync } from "../../utils/catchAsync";
import { IProperty } from "./property.interfece";
import { sendResponse } from "../../utils/sendResponse";
import { Prisma, PropertyAmenity } from "@prisma/client";

//property add
const createProperty = async (
    payload: IProperty,
    userId: string // this is the logged-in User's id, not landlordId
) => {
    // Find the landlord profile linked to this user
    const landlord = await prisma.landlord.findUnique({
        where: { userId },
    });

    if (!landlord) {
        throw new Error(
            "Landlord profile not found. Please complete your landlord profile before creating a property."
        );
    }

    // Normalize and validate amenities 
    const AMENITY_MAP: Record<string, PropertyAmenity> = {
        "security": "SECURITY_24_7",
        "elevator": "ELEVATOR",
        "generator": "GENERATOR_BACKUP",
        "cctv": "CCTV_SURVEILLANCE",
        "ac": "CENTRAL_AC",
        "garden": "ROOFTOP_GARDEN",
        "gym": "GYM_ACCESS",
        "wifi": "WIFI",
        "parking": "PARKING",
        "gas": "PREPAID_GAS"
    };

    const data: any = { ...(payload as any), landlordId: landlord.id };

    if ((payload as any).amenities) {
        const incoming: any[] = (payload as any).amenities;
        if (!Array.isArray(incoming)) {
            throw new Error("amenities must be an array of strings or enum keys");
        }

        const mapped: PropertyAmenity[] = [];
        const unknown: string[] = [];

        const enumValues = (Object.values(PropertyAmenity) as string[]);
        for (const a of incoming) {
            const key = String(a).toLowerCase().trim();
            let mappedVal: PropertyAmenity | undefined;

            if (AMENITY_MAP[key]) {
                mappedVal = AMENITY_MAP[key];
            } else if (enumValues.includes(String(a))) {
                mappedVal = String(a) as PropertyAmenity;
            } else if (enumValues.includes(String(a).toUpperCase())) {
                mappedVal = String(a).toUpperCase() as PropertyAmenity;
            } else {
                // try matching by normalized enum (case-insensitive)
                const found = enumValues.find((ev) => ev.toLowerCase() === key);
                if (found) mappedVal = found as PropertyAmenity;
            }

            if (mappedVal) mapped.push(mappedVal as PropertyAmenity);
            else unknown.push(String(a));
        }

        if (unknown.length) {
            throw new Error(
                `Unknown amenities: ${unknown.join(", ")}. Send valid enum values (e.g. SECURITY_24_7) or use a supported friendly name.`
            );
        }

        data.amenities = mapped;
    }

    const property = await prisma.property.create({
        data,
    });

    return property;
};

//show all property
const getAllProperties = async (query: Record<string, any>) => {
    const {
        searchTerm,
        minPrice,
        maxPrice,
        propertyType,
        purpose,
        page = 1,
        limit = 10,
    } = query;

    const where: Prisma.propertyWhereInput = {};

    if (searchTerm) {
        where.OR = [
            { title: { contains: searchTerm, mode: "insensitive" } },
            { district: { contains: searchTerm, mode: "insensitive" } },
            { area: { contains: searchTerm, mode: "insensitive" } },
        ];
    }

    if (propertyType) {
        where.propertyType = propertyType;
    }

    if (purpose) {
        where.purpose = purpose;
    }

    if (minPrice || maxPrice) {
        where.price = {};
        if (minPrice) {
            (where.price as Prisma.FloatFilter).gte = Number(minPrice);
        }
        if (maxPrice) {
            (where.price as Prisma.FloatFilter).lte = Number(maxPrice);
        }
    }

    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;
    const skip = (pageNum - 1) * limitNum;

    const [data, total] = await Promise.all([
        prisma.property.findMany({
            where,
            skip,
            take: limitNum,
            orderBy: { createdAt: "desc" },
            include: { landlord: true },
        }),
        prisma.property.count({ where }),
    ]);

    return {
        meta: {
            page: pageNum,
            limit: limitNum,
            total,
        },
        data,
    };
};

const assertLandlordPermission = async (
    propertyId: string,
    userId: string,
    role: string
) => {
    const property = await prisma.property.findUnique({
        where: { id: propertyId },
        include: { landlord: true },
    });

    if (!property) {
        throw new Error("Property not found");
    }

    if (role !== "Admin" && property.landlord.userId !== userId) {
        throw new Error("You are not authorized to manage this property.");
    }

    return property;
};

const updateProperty = async (
    propertyId: string,
    payload: Partial<IProperty>,
    userId: string,
    role: string
) => {
    const property = await assertLandlordPermission(propertyId, userId, role);

    const data: any = { ...(payload as any) };

    if ((payload as any).amenities) {
        const incoming: any[] = (payload as any).amenities;
        if (!Array.isArray(incoming)) {
            throw new Error("amenities must be an array of strings or enum keys");
        }

        // Normalize and validate amenities 
        const AMENITY_MAP: Record<string, PropertyAmenity> = {
            "security": "SECURITY_24_7",
            "elevator": "ELEVATOR",
            "generator": "GENERATOR_BACKUP",
            "cctv": "CCTV_SURVEILLANCE",
            "ac": "CENTRAL_AC",
            "garden": "ROOFTOP_GARDEN",
            "gym": "GYM_ACCESS",
            "wifi": "WIFI",
            "parking": "PARKING",
            "gas": "PREPAID_GAS"
        };

        const mapped: PropertyAmenity[] = [];
        const unknown: string[] = [];
        const enumValues = (Object.values(PropertyAmenity) as string[]);

        for (const a of incoming) {
            const key = String(a).toLowerCase().trim();
            let mappedVal: PropertyAmenity | undefined;

            if (AMENITY_MAP[key]) {
                mappedVal = AMENITY_MAP[key];
            } else if (enumValues.includes(String(a))) {
                mappedVal = String(a) as PropertyAmenity;
            } else if (enumValues.includes(String(a).toUpperCase())) {
                mappedVal = String(a).toUpperCase() as PropertyAmenity;
            } else {
                const found = enumValues.find((ev) => ev.toLowerCase() === key);
                if (found) mappedVal = found as PropertyAmenity;
            }

            if (mappedVal) mapped.push(mappedVal as PropertyAmenity);
            else unknown.push(String(a));
        }

        if (unknown.length) {
            throw new Error(
                `Unknown amenities: ${unknown.join(", ")}. Send valid enum values (e.g. SECURITY_24_7) or use a supported friendly name.`
            );
        }

        data.amenities = mapped;
    }

    const updated = await prisma.property.update({
        where: { id: property.id },
        data,
    });

    return updated;
};

const deleteProperty = async (
    propertyId: string,
    userId: string,
    role: string
) => {
    await assertLandlordPermission(propertyId, userId, role);

    const deleted = await prisma.property.delete({
        where: { id: propertyId },
    });

    return deleted;
};

//get property by id
const getPropertyById =async (id: string) => {
    if (!id) {
        throw new Error("Property Id is required");
    }

    const property = await prisma.property.findUnique({
        where: { id },
        include: { landlord: true },
    });

    if (!property) {
        throw new Error("Property not found");
    }

    return property;
};


export const propertyService = {
    createProperty,
    getAllProperties,
    getPropertyById,
    updateProperty,
    deleteProperty,
};