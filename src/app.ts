import express,{Application} from 'express'
import {Request,Response} from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
const app:Application=express()

//middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
    origin:'config.app_url',
    credentials:true
}))

app.get('/',(req:Request,res:Response)=>{
    res.send('Hello, World!')
})
export default app