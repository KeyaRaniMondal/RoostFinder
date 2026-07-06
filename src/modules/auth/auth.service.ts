import { LoginUser } from "./auth.interface";
import { prisma } from "../../lib/prisma";
import bcrypt from "bcryptjs";

const loginUser = async (payload: LoginUser) => {
    const { email, password } = payload

    const user = await prisma.user.findUniqueOrThrow({
        where: { email: email as unknown as string }
    })
    if (user.activeStatus === "BLOCKED") {
        throw new Error('User is blocked! reach for support')
    }
    const isPasswordMatched = await bcrypt.compare(String(password), String(user.password))
    if (!isPasswordMatched) {
        throw new Error("password is incorrect");
    }
}

export const authService = {
    loginUser
}