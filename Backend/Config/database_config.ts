import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();


const database_connection = async (): Promise<void> => {
  try {
    const mongoUrl = process.env.MONGO_URL;

    if (!mongoUrl) {
      console.error("MONGO_URL is not defined in the environment variables.");
      process.exit(1);  
    }
    await mongoose.connect(mongoUrl);
    console.log("Database is connected");
  } catch (error) {
    console.log("Database is not connected", error);
  }
};

export default database_connection;
