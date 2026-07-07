// import { prisma } from "../../lib/prisma";
// import { IProperty } from "./property.interfece";

// const createProperty = async (
//     payload: IProperty,
//     landlordId: string
// ) => {
//     // ensure landlord exists to avoid FK constraint errors
//     const landlord = await prisma.landlord.findUnique({ where: { id: landlordId } });
//     if (!landlord) throw new Error(`Landlord not found: ${landlordId}`);

//     const property = await prisma.property.create({
//         data: {
//             ...(payload as any),
//             landlord: { connect: { id: landlordId } },
//         },
//     });

//     return property;
// };

// export const propertyService = {
//     createProperty
// };

import { prisma } from "../../lib/prisma";
import { IProperty } from "./property.interfece";

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

export const propertyService = {
    createProperty,
};