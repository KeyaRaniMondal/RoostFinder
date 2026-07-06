import { LoginUser } from "./auth.interface";
import { prisma } from "../../lib/prisma";
import bcrypt from "bcryptjs";
import { jwtUtils } from "../../utils/jwt";
import config from "../../config";
import { JwtPayload, SignOptions } from "jsonwebtoken";

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
    const jwtPayload = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
    }


    const accessToken = jwtUtils.createToken(
        jwtPayload,
        config.JWT_ACCESS_SECRET!,
        config.JWT_ACCESS_EXPIRES_IN as SignOptions
    );


    const refreshToken = jwtUtils.createToken(
        jwtPayload,
        config.JWT_REFRESH_SECRET!,
        config.JWT_REFRESH_EXPIRES_IN as SignOptions
    );

    return {
        accessToken,
        refreshToken
    };
}

const refreshToken = async (refreshToken: string) => {
    const verifiedRefreshToken = jwtUtils.verifyToken(refreshToken, config.JWT_REFRESH_SECRET!);

    if (!verifiedRefreshToken.success) {
        throw new Error(verifiedRefreshToken.error)
    }

    const { id } = verifiedRefreshToken.data as JwtPayload;

    const user = await prisma.user.findUniqueOrThrow({
        where: {
            id
        }
    })

    if (user.activeStatus === "BLOCKED") {
        throw new Error("User is blocked!")
    }

    const jwtPayload = {
        id,
        name: user.name,
        email: user.email,
        role: user.role
    }


    const accessToken = jwtUtils.createToken(
        jwtPayload,
        config.JWT_ACCESS_SECRET!,
        config.JWT_ACCESS_EXPIRES_IN as SignOptions
    );

    return { accessToken }
}


export const authService = {
    loginUser,
    refreshToken
}