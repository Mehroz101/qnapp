import { Router, Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { env } from '../../config/env';

interface MockUserProfile {
  id: string;
  username: string;
  email: string;
  bookmarks: string[];
  upvoted: string[];
  downvoted: string[];
}

const users = new Map<string, { profile: MockUserProfile; passwordHash: string }>();

const router = Router();

function signToken(userId: string) {
  return jwt.sign({ sub: userId }, env.jwtSecret, { expiresIn: '7d' });
}

function auth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) return res.status(401).json({ error: 'Missing token' });
  try {
    const payload = jwt.verify(token, env.jwtSecret) as { sub: string };
    (req as any).userId = payload.sub;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

router.post('/register', async (req: Request, res: Response) => {
  const { username, email, password } = req.body || {};
  if (!username || !email || !password) return res.status(400).json({ error: 'Missing fields' });
  if ([...users.values()].some((u) => u.profile.email === email || u.profile.username === username)) {
    return res.status(409).json({ error: 'User exists' });
  }
  const id = `u_${Date.now()}`;
  const passwordHash = await bcrypt.hash(password, 10);
  const profile: MockUserProfile = { id, username, email, bookmarks: [], upvoted: [], downvoted: [] };
  users.set(id, { profile, passwordHash });
  const token = signToken(id);
  res.json({ token, user: profile });
});

router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Missing fields' });
  const entry = [...users.values()].find((u) => u.profile.email === email);
  if (!entry) return res.status(401).json({ error: 'Invalid credentials' });
  const ok = await bcrypt.compare(password, entry.passwordHash);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
  const token = signToken(entry.profile.id);
  res.json({ token, user: entry.profile });
});

router.get('/me', auth, (req: Request, res: Response) => {
  const entry = users.get((req as any).userId);
  if (!entry) return res.status(404).json({ error: 'Not found' });
  res.json(entry.profile);
});

router.put('/me', auth, (req: Request, res: Response) => {
  const entry = users.get((req as any).userId);
  if (!entry) return res.status(404).json({ error: 'Not found' });
  const { username } = req.body || {};
  if (username) entry.profile.username = username;
  res.json(entry.profile);
});

export default router;


