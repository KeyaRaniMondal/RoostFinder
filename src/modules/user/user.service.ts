import bcrypt from 'bcryptjs'
import config from '../../config/index'
import { prisma } from '../../lib/prisma'
import { RegisterUserPayload, UpdateProfilePayload } from './user.interface'
import { Role } from '@prisma/client'

const registerUserIntoDB = async (payload: RegisterUserPayload) => {
  const { name, email, password, profilePhoto } = payload
  const rawRole = payload.role ?? (payload as RegisterUserPayload & { Role?: string }).Role ?? 'Tenant'

  const existingUser = await prisma.user.findUnique({
    where: { email },
  })

  if (existingUser) {
    throw new Error('User already exists')
  }

  const normalizedRole = String(rawRole).trim().toLowerCase()
  const finalRole: Role = normalizedRole === 'admin'
    ? 'Admin'
    : normalizedRole === 'landlord'
      ? 'Landlord'
      : 'Tenant'

  const saltRounds = Number(config.BCRYPT_SALT_ROUNDS) || 10
  const hashedPassword = await bcrypt.hash(password, saltRounds)

  const createdUser = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: finalRole,
      profiel: {
        create: {
          profilePhoto: profilePhoto ?? null,
        }
      },
      updatedAt: new Date()
    }
  })

  const user = await prisma.user.findUnique({
    where: {
      id: createdUser.id,
    },
    omit: {
      password: true
    },
    include: {
      profiel: true
    }
  })

  return user;
}

const getMyProfileFromDb = async (userId: string) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    omit: {
      password: true
    },
    include: {
      profiel: true
    }
  });

  return user;
}

const updateMyProfile = async (userId: string, payload: UpdateProfilePayload) => {
  const { name, email, profilePhoto, bio } = payload;

  if (email) {
    const existing = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existing && existing.id !== userId) {
      throw new Error("Email is already in use");
    }
  }

  if (name !== undefined || email !== undefined) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(email !== undefined ? { email } : {}),
      },
    });
  }

  await prisma.profile.upsert({
    where: { userId },
    create: {
      userId,
      profilePhoto: profilePhoto?.trim() || null,
      bio: bio?.trim() || null,
    },
    update: {
      ...(profilePhoto !== undefined ? { profilePhoto: profilePhoto?.trim() || null } : {}),
      ...(bio !== undefined ? { bio: bio?.trim() || null } : {}),
    },
  });

  return getMyProfileFromDb(userId);
}

export const userService = {
  registerUserIntoDB,
  getMyProfileFromDb,
  updateMyProfile
}