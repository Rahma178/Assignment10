import express from 'express'
import connectionDB from './DB/connectionDB.js'
import userRouter from './modules/users/user.controller.js'
import cors from 'cors'
import connectionRedis, { redis_client } from './DB/models/connection.redis.js'
import { setValue } from './DB/models/service/redis.service.js'
import messageRouter from './modules/message/message.controller.js'
const app = express()
const port =3000

const bootstrap = async()=>{

    app.use(cors({
        origin:"*"
    }))
    app.use(express.json())

    await connectionDB()
    await connectionRedis()
    // await redis_client.set("name", "rahma")
    await setValue({key:'gender', value: 'female'})


    app.get('/',(req,res,next)=>{
        res.status(200).json({message:'hello on my saraha app'})
    })

    app.use("/users",userRouter)
    app.use("/messages",messageRouter)


    app.use("{/*demo}",(req,res,next)=>{
        // res.status(404).json({message:`url: ${req.originalUrl} with method :${req.method} not found`, statuscode:404})
        throw new Error(`url: ${req.originalUrl} with method :${req.method} not found`,{cause:404})

    })


    app.use((err,req,res,next)=>{
        console.log(err);
        // res.status(err.cause).json({error:err.message, stack: err.stack})
        res.status(err.cause || 500).json({ error: err.message, stack: err.stack })        
    })

    app.listen(port,()=>{
        console.log(`server is running on port ${port}`);
        
    })
}

export default bootstrap