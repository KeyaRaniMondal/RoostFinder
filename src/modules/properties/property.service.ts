import httpStatus from "http-status";
import { Request, Response, NextFunction } from "express";
import { prisma } from "../../lib/prisma";
import { catchAsync } from "../../utils/catchAsync";
import { IProperty } from "./property.interfece";
import { sendResponse } from "../../utils/sendResponse";
import { Prisma } from "../../../prisma/generated/prisma/client";

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

    const property = await prisma.property.create({
        data: {
            ...(payload as any),
            landlordId: landlord.id, // use Landlord.id, not User.id
        },
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
    getPropertyById
};