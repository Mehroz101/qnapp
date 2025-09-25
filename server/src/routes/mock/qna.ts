import { Router, Request, Response } from 'express';
import { v4 as uuid } from 'uuid';

const router = Router();

interface MockAnswer {
  id: string;
  authorId: string;
  text: string; // supports (  code here  ) markers
  createdAt: number;
}

interface MockQuestion {
  id: string;
  authorId: string;
  title: string;
  description: string;
  tags: string[];
  answers: MockAnswer[];
  upvotes: Set<string>;
  downvotes: Set<string>;
}

const questions = new Map<string, MockQuestion>();

function requireAuth(req: Request, res: Response): string | null {
  const uid = (req as any).userId || req.header('x-mock-user');
  if (!uid) {
    res.status(401).json({ error: 'Unauthorized. Provide x-mock-user for mock mode.' });
    return null;
  }
  return uid;
}

router.get('/questions', (_req: Request, res: Response) => {
  const list = [...questions.values()].map((q) => ({
    ...q,
    upvotes: q.upvotes.size,
    downvotes: q.downvotes.size
  }));
  res.json(list);
});

router.post('/questions', (req: Request, res: Response) => {
  const userId = requireAuth(req, res);
  if (!userId) return;
  const { title, description, tags } = req.body || {};
  if (!title || !description) return res.status(400).json({ error: 'Missing fields' });
  const id = uuid();
  const q: MockQuestion = {
    id,
    authorId: userId,
    title,
    description,
    tags: Array.isArray(tags) ? tags : [],
    answers: [],
    upvotes: new Set(),
    downvotes: new Set()
  };
  questions.set(id, q);
  res.status(201).json({ ...q, upvotes: 0, downvotes: 0 });
});

router.put('/questions/:id', (req: Request, res: Response) => {
  const userId = requireAuth(req, res);
  if (!userId) return;
  const q = questions.get(req.params.id);
  if (!q) return res.status(404).json({ error: 'Not found' });
  if (q.authorId !== userId) return res.status(403).json({ error: 'Forbidden' });
  const { title, description, tags } = req.body || {};
  if (title) q.title = title;
  if (description) q.description = description;
  if (Array.isArray(tags)) q.tags = tags;
  res.json({ ...q, upvotes: q.upvotes.size, downvotes: q.downvotes.size });
});

router.post('/questions/:id/answer', (req: Request, res: Response) => {
  const userId = requireAuth(req, res);
  if (!userId) return;
  const q = questions.get(req.params.id);
  if (!q) return res.status(404).json({ error: 'Not found' });
  const { text } = req.body || {};
  if (!text) return res.status(400).json({ error: 'Text required' });
  const a: MockAnswer = { id: uuid(), authorId: userId, text, createdAt: Date.now() };
  q.answers.push(a);
  res.status(201).json(a);
});

router.post('/questions/:id/upvote', (req: Request, res: Response) => {
  const userId = requireAuth(req, res);
  if (!userId) return;
  const q = questions.get(req.params.id);
  if (!q) return res.status(404).json({ error: 'Not found' });
  q.downvotes.delete(userId);
  q.upvotes.add(userId);
  res.json({ upvotes: q.upvotes.size, downvotes: q.downvotes.size });
});

router.post('/questions/:id/downvote', (req: Request, res: Response) => {
  const userId = requireAuth(req, res);
  if (!userId) return;
  const q = questions.get(req.params.id);
  if (!q) return res.status(404).json({ error: 'Not found' });
  q.upvotes.delete(userId);
  q.downvotes.add(userId);
  res.json({ upvotes: q.upvotes.size, downvotes: q.downvotes.size });
});

router.post('/questions/:id/bookmark', (req: Request, res: Response) => {
  const userId = requireAuth(req, res);
  if (!userId) return;
  const q = questions.get(req.params.id);
  if (!q) return res.status(404).json({ error: 'Not found' });
  // Since this is mock, just return success; real implementation will update user
  res.json({ ok: true });
});

export default router;


