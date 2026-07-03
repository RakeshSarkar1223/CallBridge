import express from 'express'
import userRouter from './route/user.route.ts'
import cookieParser from 'cookie-parser';
import cors from 'cors'

const app = express();

app.use(express.json())
app.use(cors({
    origin: "http://localhost:5000",
    credentials:true
}))
app.use(cookieParser())

app.get("/test", (req, res) => {
    res.status(200).send("App is running")
});

app.use("/api/user", userRouter);

export default app;