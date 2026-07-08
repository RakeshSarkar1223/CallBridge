import "dotenv/config";
import server from "./app.ts";
import { connectDB } from "./utils/connect.ts";


const startServer = async () => {
  try {
    await connectDB();

    const PORT = process.env.PORT || 5001;

    server.listen(PORT, () => {
      console.log(`App is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();