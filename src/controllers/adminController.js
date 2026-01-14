import User from "../models/user.js";
import mongoose from "mongoose";

export const getUsers = async (_, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

export const getUser = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  const user = await User.findById(id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.json(user);
};

export const createUser = async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email) {
    return res.status(400).json({ message: "Name and email are required" });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: "Email already exists" });
  }

  try {
    const user = await User.create({
      name,
      email,
      password,
      role: role || "User",
    });

    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ message: "Failed to create user" });
  }
};

export const updateUser = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  if (!Object.keys(req.body).length) {
    return res.status(400).json({ message: "Update data is required" });
  }

  if (req.body.email) {
    const emailExists = await User.findOne({
      email: req.body.email,
      _id: { $ne: id },
    });

    if (emailExists) {
      return res.status(400).json({ message: "Email already in use" });
    }
  }

  const user = await User.findByIdAndUpdate(id, req.body, { new: true });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.json(user);
};

export const deleteUser = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  const user = await User.findByIdAndDelete(id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.json({ message: "User deleted successfully" });
};

export const toggleUserStatus = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  const user = await User.findById(id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  user.status = user.status === "Active" ? "Inactive" : "Active";
  await user.save();

  res.json({
    message: `User ${user.status === "Active" ? "activated" : "deactivated"}`,
    status: user.status,
  });
};
