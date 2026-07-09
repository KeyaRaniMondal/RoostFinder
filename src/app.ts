import express, { Application, Request, Response } from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import config from './config/index'
import { userRoutes } from './modules/user/user.route'
import { authRoutes } from './modules/auth/auth.route'
import { propertyRoutes } from './modules/properties/property.route'
import { landlordRoutes } from './modules/landLord/landlord.route'
import { categoryRoutes } from './modules/categories/category.route'
import { rentalRoutes } from './modules/rental/rental.route'
import { adminRoutes } from './modules/admin/admin.route'
import { paymentRoutes } from './modules/payments/payment.route'
import { paymentController } from './modules/payments/payment.controller'

const app: Application = express()

app.post(
    "/api/payments/webhook",
    express.raw({ type: "application/json" }),
    paymentController.stripeWebhook
);

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

//All Routes for request functionality
app.use('/api/auth', userRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/properties', propertyRoutes)
app.use('/api/landlord', landlordRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/rentals", rentalRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/payments", paymentRoutes);

export default app