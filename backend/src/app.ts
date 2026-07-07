import express from 'express'
import userRouter from './route/user.route.ts';
import roomRouter from './route/room.route.ts';
import messageRouter from './route/message.route.ts';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import {connect} from './socket/index.ts'

const app = express();

app.use(express.json())
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials:true
}))

app.use(cookieParser())

app.get("/test", (req, res) => {
    res.status(200).send("App is running")
});

app.use("/api/user", userRouter);
app.use("/api/room", roomRouter);
app.use("/api/message", messageRouter);

const {server, io} = connect(app);

export {io};

export default server;