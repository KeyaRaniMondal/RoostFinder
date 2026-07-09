import bcrypt from 'bcryptjs'
import config from '../../config/index.js'
import { prisma } from '../../lib/prisma.js'
import { RegisterUserPayload } from './user.interface.js'
import { Role } from '../../../prisma/generated/prisma/enums.js'

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

export const userService = {
  registerUserIntoDB,
  getMyProfileFromDb
}