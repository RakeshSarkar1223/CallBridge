import {prisma} from "../config/prisma.ts";

export const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log("✅ PostgreSQL Connected Successfully");
  } catch (error) {
    console.error("❌ Database Connection Failed");
    console.error(error);
    process.exit(1);
  }
}

