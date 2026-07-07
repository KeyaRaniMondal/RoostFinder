import express, { Application, Request, Response } from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import config from './config'
import { userRoutes } from './modules/user/user.route'
import { authRoutes } from './modules/auth/auth.route'
import { propertyRoutes } from './modules/properties/property.route'
import { landlordRoutes } from './modules/landLord/landlord.route'
import { categoryRoutes } from './modules/categories/category.route'

const app: Application = express()

// middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(
  cors({
    origin: config.APP_URL,
    credentials: true,
  })
)

app.get('/', (req: Request, res: Response) => {
  res.send('Hello, World!')
})

app.use('/api/auth', userRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/properties', propertyRoutes)
app.use('/api/landlords', landlordRoutes);
app.use("/api/categories", categoryRoutes);

export default app