import dotenv from "dotenv";
dotenv.config();
const dbUrl = process.env.DB_URL;
import mongoose from "mongoose";
if (!dbUrl) {
  throw new Error("database url missing");
}
const connectDb = async () => {
  try {
    await mongoose.connect(dbUrl, {
      autoIndex: true,
    });
  } catch {
    console.error("❌ Database connection failed");
    process.exit(1);
  }
};
export default connectDb;
