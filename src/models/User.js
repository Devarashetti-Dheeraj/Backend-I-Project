import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String },
    email: { type: String, unique: true, required: true },
    password: { type: String },
    role: { type: String, enum: ["Admin", "User"], default: "User" },
    authProvider: { type: String, enum: ["Local", "Google"], default: "Local" },
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
