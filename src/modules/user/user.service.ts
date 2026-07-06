import bcrypt from 'bcryptjs'
import config from '../../config'
import { prisma } from '../../lib/prisma'
import { RegisterUserPayload } from './user.interface'

const registerUserIntoDB = async (payload: RegisterUserPayload) => {
  const { name, email, password, profilePhoto } = payload

  const existingUser = await prisma.user.findUnique({
    where: { email },
  })

  if (existingUser) {
    throw new Error('User already exists')
  }

  const saltRounds = Number(config.BCRYPT_SALT_ROUNDS) || 10
  const hashedPassword = await bcrypt.hash(password, saltRounds)

  const createdUser = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
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

const getMyProfileFromDb = async (userId : string) => {
    const user = await prisma.user.findUniqueOrThrow({
        where : {id : userId},
        omit : {
            password : true
        },
        include : {
            profiel  : true
        }
    });

    return user;
}

export const userService = {
  registerUserIntoDB,
  getMyProfileFromDb
}