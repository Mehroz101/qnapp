import { Request, Response } from 'express';
import { authService } from '../services/authService.js';
import { z } from 'zod';

const registerSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6)
});

const loginSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6)
});

export const authController = {
  async register(req: Request, res: Response) {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.issues });
    const result = await authService.register(parsed.data);
    if (!result) return res.status(400).json({ error: 'Registration failed' });
    res.status(201).json(result);
  },

  async login(req: Request, res: Response) {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.issues });
    const result = await authService.login(parsed.data);
    if (!result) return res.status(401).json({ error: 'Invalid credentials' });
    res.json(result);
  },

  async getMe(req: Request, res: Response) {
    const userId = (req as any).auth.userId;
    const user = await authService.getMe(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  }
};
