import express from 'express'
import userRouter from './route/user.route.ts';
import roomRouter from './route/room.route.ts';
import messageRouter from './route/message.route.ts';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import {connect} from './socket/index.ts'

const app = express();

// Trust reverse proxy (such as Render's load balancer) to ensure Express knows the connection is HTTPS, allowing Secure cookies to be sent
app.set("trust proxy", 1);

app.use(express.json())

// Robust CORS configuration to handle trailing slashes dynamically
const allowedOrigin = process.env.FRONTEND_URL;
app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, postman)
        if (!origin) return callback(null, true);
        
        if (!allowedOrigin) {
            return callback(new Error("FRONTEND_URL environment variable is not defined"), false);
        }
        
        const cleanAllowed = allowedOrigin.replace(/\/$/, "");
        const cleanOrigin = origin.replace(/\/$/, "");
        
        // Allow matched production origin or local development origins
        if (cleanOrigin === cleanAllowed || (process.env.NODE_ENV !== "production" && cleanOrigin.startsWith("http://localhost:"))) {
            callback(null, true);
        } else {
            callback(new Error(`Origin ${origin} not allowed by CORS`), false);
        }
    },
    credentials: true
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