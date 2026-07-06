import dotenv from 'dotenv'
import path from 'path'
dotenv.config({path:path.join(process.cwd(),'.env')})

export default{
    PORT:process.env.PORT,
    APP_URL:process.env.APP_URL,
    DATABASE_URL:process.env.DATABASE_URL,
    BCRYPT_SALT_ROUNDS:process.env.BCRYPT_SALT_ROUNDS,
    JWT_ACCESS_SECRET:process.env.JWT_ACCESS_SECRET,
    JWT_ACCESS_EXPIRES_IN:process.env.JWT_ACCESS_EXPIRES_IN,
    JWT_REFRESH_SECRET:process.env.JWT_REFRESH_SECRET,
    JWT_REFRESH_EXPIRES_IN:process.env.JWT_REFRESH_EXPIRES_IN,
}