import bcrypt from 'bcryptjs'
import config from '../../config'
import { prisma } from '../../lib/prisma'
import { RegisterUserPayload } from './user.interface'

const registerUserIntoDB = async (payload: RegisterUserPayload) => {
  const { name, email, password } = payload

  const existingUser = await prisma.user.findUnique({
    where: { email },
  })

  if (existingUser) {
    throw new Error('User already exists')
  }

  const saltRounds = Number(config.BCRYPT_SALT_ROUNDS) || 10
  const hashedPassword = await bcrypt.hash(password, saltRounds)

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      Role: 'USER'
    }
  })

  return user
}

export const userService = {
  registerUserIntoDB,
}