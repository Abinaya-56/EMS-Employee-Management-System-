import mongoose from "mongoose";

async function connectDB(mongoURI) {
  if (!mongoURI) {
    throw new Error("MONGO_URI is not configured");
  }

  await mongoose.connect(mongoURI);
  console.log("MongoDB connected");
}

export default connectDB;
