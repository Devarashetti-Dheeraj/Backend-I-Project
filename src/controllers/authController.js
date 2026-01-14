import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.js";
import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

export const register = async (req, res) => {
  const { name, email, password } = req.body;
  if (await User.findOne({ email }))
    return res.status(409).json({ message: "Email already exists" });

  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hashed });

  res.json({ token: generateToken(user) });
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user.status === "Inactive") {
    return res.status(403).json({ message: "User account is deactivated" });
  }

  if (!user || !(await bcrypt.compare(password, user.password)))
    return res.status(401).json({ message: "Invalid credentials" });

  res.json({ token: generateToken(user) });
};

export const googleAuth = async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ message: "Google ID token is required" });
  }

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name } = payload;

    if (!email) {
      return res.status(400).json({ message: "Google account has no email" });
    }

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        name,
        email,
        authProvider: "Google",
        role: "User",
        status: "Active",
      });
    }

    if (user.status === "Inactive") {
      return res.status(403).json({ message: "User account is deactivated" });
    }

    return res.json({
      token: generateToken(user),
    });
  } catch (err) {
    return res.status(401).json({
      message: "Google Authentication Failed",
    });
  }
};
