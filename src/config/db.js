import mongoose from "mongoose";

const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI, { dbName: 'Users' });
  console.log("MongoDB connected");
};

export default connectDB;
