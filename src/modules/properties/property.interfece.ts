

import { PropertyPurpose, PropertyStatus, PropertyType } from "@prisma/client";

export interface IProperty {
    title: string;
    description: string;

    propertyType: PropertyType;
    purpose: PropertyPurpose;

    price: number;

    country: string;   // was missing — required in schema
    division: string;
    district: string;
    city: string;       // was missing — required in schema
    area: string;
    address: string;

    bedrooms?: number;
    bathrooms?: number;
    balconies?: number;

    floor?: number;
    totalFloors?: number;

    areaSize?: number;  // schema marks this optional (Float?), but interface had it required

    furnished: boolean;

    images: string[];

    status?: PropertyStatus;

    // landlordId removed — it's derived server-side from the authenticated user,
    // never trust/accept it from the client payload
}