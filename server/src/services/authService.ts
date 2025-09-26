import mongoose from 'mongoose';
import { User } from '../models/User';
import bcrypt from 'bcryptjs';
import { env } from '../config/env';
import jwt from "jsonwebtoken";

export const authService = {
  async register(data: { username: string; password: string; email?: string }) {
    const existing = await User.findOne({ username: data.username }).exec();
    if (existing) return null;
    const hashed = await bcrypt.hash(data.password, 10);
    const user = await User.create({ username: data.username, passwordHash: hashed, email: data.email ?? `${data.username}@example.com` });
    return { id: user._id, username: user.username };
  },
  async login(data: { username: string; password: string }) {
    const user = await User.findOne({ username: data.username }).exec();
    if (!user) return null;
    const valid = await bcrypt.compare(data.password, user.passwordHash);
    if (!valid) return null;
    const accessToken = jwt.sign({ userId: user._id }, env.jwtSecret, { expiresIn: '7d' }); 
    return { id: user._id, username: user.username, accessToken };
  },
  async getMe(userId: string) {
    const user = await User.findById(userId).exec();
    if (!user) return null;
    return { id: user._id, username: user.username };
  }
};
