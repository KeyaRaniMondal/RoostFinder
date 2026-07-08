import { prisma } from "../../lib/prisma";
import { ActiveStatus, Prisma } from "../../../prisma/generated/prisma/client";

// ---- Users ----

const getAllUsers = async (query: Record<string, any>) => {
    const { searchTerm, role, activeStatus, page = 1, limit = 10 } = query;

    const where: Prisma.UserWhereInput = {};

    if (searchTerm) {
        where.OR = [
            { name: { contains: searchTerm, mode: "insensitive" } },
            { email: { contains: searchTerm, mode: "insensitive" } },
        ];
    }

    if (role) {
        where.role = role;
    }

    if (activeStatus) {
        where.activeStatus = activeStatus;
    }

    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;
    const skip = (pageNum - 1) * limitNum;

    const [data, total] = await Promise.all([
        prisma.user.findMany({
            where,
            skip,
            take: limitNum,
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                activeStatus: true,
                createdAt: true,
                landLoard: true, 
            },
        }),
        prisma.user.count({ where }),
    ]);

    return {
        meta: { page: pageNum, limit: limitNum, total },
        data,
    };
};

const updateUserStatus = async (userId: string, activeStatus: ActiveStatus) => {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
        throw new Error("User not found");
    }

    const updated = await prisma.user.update({
        where: { id: userId },
        data: { activeStatus },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            activeStatus: true,
        },
    });

    return updated;
};

// ---- Properties ----

const getAllPropertiesAdmin = async (query: Record<string, any>) => {
    const { searchTerm, status, page = 1, limit = 10 } = query;

    const where: Prisma.propertyWhereInput = {};

    if (searchTerm) {
        where.OR = [
            { title: { contains: searchTerm, mode: "insensitive" } },
            { city: { contains: searchTerm, mode: "insensitive" } },
        ];
    }

    if (status) {
        where.status = status;
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
            include: {
                landlord: {
                    include: {
                        user: {
                            select: { id: true, name: true, email: true },
                        },
                    },
                },
            },
        }),
        prisma.property.count({ where }),
    ]);

    return {
        meta: { page: pageNum, limit: limitNum, total },
        data,
    };
};

// ---- Rentals ----

const getAllRentalsAdmin = async (query: Record<string, any>) => {
    const { status, page = 1, limit = 10 } = query;

    const where: Prisma.RentalRequestWhereInput = {};

    if (status) {
        where.status = status;
    }

    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;
    const skip = (pageNum - 1) * limitNum;

    const [data, total] = await Promise.all([
        prisma.rentalRequest.findMany({
            where,
            skip,
            take: limitNum,
            orderBy: { createdAt: "desc" },
            include: {
                property: true,
                tenant: {
                    select: { id: true, name: true, email: true },
                },
            },
        }),
        prisma.rentalRequest.count({ where }),
    ]);

    return {
        meta: { page: pageNum, limit: limitNum, total },
        data,
    };
};

export const adminService = {
    getAllUsers,
    updateUserStatus,
    getAllPropertiesAdmin,
    getAllRentalsAdmin,
};