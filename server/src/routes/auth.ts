import { Router, Request, Response } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { authRequired, signJwt } from '../middleware/auth';

const router = Router();

const registerSchema = z.object({
  username: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6)
});

router.post('/register', async (req: Request, res: Response) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { username, email, password } = parsed.data;
  const existing = await User.findOne({ $or: [{ email }, { username }] });
  if (existing) return res.status(409).json({ error: 'User already exists' });
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ username, email, passwordHash });
  const token = signJwt({ userId: user._id.toString() });
  return res.json({ token, user: { id: user._id, username, email } });
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

router.post('/login', async (req: Request, res: Response) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { email, password } = parsed.data;
  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
  const token = signJwt({ userId: user._id.toString() });
  return res.json({ token, user: { id: user._id, username: user.username, email: user.email } });
});

router.get('/me', authRequired, async (req: Request, res: Response) => {
  const userId = (req as any).auth.userId;
  const user = await User.findById(userId).select('-passwordHash');
  if (!user) return res.status(404).json({ error: 'User not found' });
  return res.json(user);
});

export default router;


