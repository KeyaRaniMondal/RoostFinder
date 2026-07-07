import { PropertyType } from "../../../prisma/generated/prisma/client";

const getAllCategories = async () => {
    const categories = Object.values(PropertyType);

    return categories;
};

export const categoryService = {
    getAllCategories,
};