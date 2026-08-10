import { GoogleLoginPayload, LoginUser } from "./auth.interface";
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
    if (user.activeStatus === "BANNED") {
        throw new Error('User is baned! reach for support')
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

const googleLogin = async (payload: GoogleLoginPayload) => {
    const { name, email, emailVerified, image } = payload

    if (!email) {
        throw new Error('Email is required')
    }

    let user = await prisma.user.findUnique({
        where: { email },
        include: { profiel: true }
    })

    if (!user) {
        user = await prisma.user.create({
            data: {
                name: name ?? email.split('@')[0],
                email,
                emailVerified: emailVerified ? new Date() : null,
                image: image ?? null,
                password: null,
                role: 'Tenant',
                profiel: {
                    create: { profilePhoto: image ?? null }
                }
            },
            include: { profiel: true }
        })
    } else if (!user.profiel) {
        await prisma.user.update({
            where: { id: user.id },
            data: {
                profiel: { create: { profilePhoto: image ?? null } }
            }
        })
    }

    if (user.activeStatus === "BANNED") {
        throw new Error('User is baned! reach for support')
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

    if (user.activeStatus === "BANNED") {
        throw new Error("User is baned!")
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
    googleLogin,
    refreshToken
}