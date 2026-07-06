import {prisma} from "../config/prisma.ts";
import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log("PostgreSQL Connected Successfully");

    if (!process.env.MONGO_URL) {
      throw new Error("MONGO_URL is not defined in environment variables");
    }
    await mongoose.connect(process.env.MONGO_URL);
    console.log("MongoDB Connected Successfully");
  } catch (error) {
    console.error("Database Connection Failed");
    console.error(error);
    process.exit(1);
  }
}

