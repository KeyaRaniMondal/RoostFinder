import express, { Application, Request, Response } from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import config from './config'
import { userRoutes } from './modules/user/user.route'

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

export default app