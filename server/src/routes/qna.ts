import { Router } from 'express';
import type { Request, Response } from 'express';
import { z } from 'zod';
import { Question } from '../models/Question';
import { User } from '../models/User';
import { authRequired } from '../middleware/auth';

const router = Router();

// Create a question
const createQuestionSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(3),
  tags: z.array(z.string()).optional().default([])
});

router.post('/', authRequired, async (req: Request, res: Response) => {
  const parsed = createQuestionSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const userId = (req as any).auth.userId;
  const q = await (Question as any).create({ ...parsed.data, author: userId });
  res.status(201).json(q);
});

// List questions
router.get('/', async (_req: Request, res: Response) => {
  const list = await (Question as any).find().sort({ createdAt: -1 }).limit(100);
  res.json(list);
});

// Get question detail
router.get('/:id', async (req: Request, res: Response) => {
  const q = await (Question as any).findById(req.params.id);
  if (!q) return res.status(404).json({ error: 'Not found' });
  res.json(q);
});

// Update own question
router.put('/:id', authRequired, async (req: Request, res: Response) => {
  const userId = (req as any).auth.userId;
  const q = await (Question as any).findOne({ _id: req.params.id, author: userId });
  if (!q) return res.status(404).json({ error: 'Not found or not owner' });
  const { title, description, tags } = req.body;
  if (title) q.title = title;
  if (description) q.description = description;
  if (tags) q.tags = tags;
  await q.save();
  res.json(q);
});

// Delete own question
router.delete('/:id', authRequired, async (req: Request, res: Response) => {
  const userId = (req as any).auth.userId;
  const q = await (Question as any).findOneAndDelete({ _id: req.params.id, author: userId });
  if (!q) return res.status(404).json({ error: 'Not found or not owner' });
  res.json({ ok: true });
});

// Answer to a question (with code blocks supported by frontend renderer)
const answerSchema = z.object({ text: z.string().min(1) });
router.post('/:id/answers', authRequired, async (req: Request, res: Response) => {
  const userId = (req as any).auth.userId;
  const parsed = answerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const q = await (Question as any).findById(req.params.id);
  if (!q) return res.status(404).json({ error: 'Not found' });
  q.answers.push({ author: userId as any, text: parsed.data.text, createdAt: new Date() });
  await q.save();
  res.status(201).json(q);
});

// Upvote / Downvote
router.post('/:id/upvote', authRequired, async (req: Request, res: Response) => {
  const userId = (req as any).auth.userId;
  const q = await (Question as any).findById(req.params.id);
  if (!q) return res.status(404).json({ error: 'Not found' });
  const user = await (User as any).findById(userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const qidStr = q._id.toString();
  const upvotedIds = user.upvoted.map((id: any) => id.toString());
  const downvotedIds = user.downvoted.map((id: any) => id.toString());
  const alreadyUp = upvotedIds.includes(qidStr);
  const alreadyDown = downvotedIds.includes(qidStr);
  if (!alreadyUp) {
    user.upvoted.push(q._id);
    q.upvotes += 1;
  }
  if (alreadyDown) {
    user.downvoted = user.downvoted.filter((id: any) => id.toString() !== qidStr) as any;
    q.downvotes = Math.max(0, q.downvotes - 1);
  }
  await Promise.all([user.save(), q.save()]);
  res.json({ upvotes: q.upvotes, downvotes: q.downvotes });
});

router.post('/:id/downvote', authRequired, async (req: Request, res: Response) => {
  const userId = (req as any).auth.userId;
  const q = await (Question as any).findById(req.params.id);
  if (!q) return res.status(404).json({ error: 'Not found' });
  const user = await (User as any).findById(userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const qidStr = q._id.toString();
  const downvotedIds = user.downvoted.map((id: any) => id.toString());
  const upvotedIds = user.upvoted.map((id: any) => id.toString());
  const alreadyDown = downvotedIds.includes(qidStr);
  const alreadyUp = upvotedIds.includes(qidStr);
  if (!alreadyDown) {
    user.downvoted.push(q._id);
    q.downvotes += 1;
  }
  if (alreadyUp) {
    user.upvoted = user.upvoted.filter((id: any) => id.toString() !== qidStr) as any;
    q.upvotes = Math.max(0, q.upvotes - 1);
  }
  await Promise.all([user.save(), q.save()]);
  res.json({ upvotes: q.upvotes, downvotes: q.downvotes });
});

// Bookmark toggle
router.post('/:id/bookmark', authRequired, async (req: Request, res: Response) => {
  const userId = (req as any).auth.userId;
  const user = await (User as any).findById(userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const qid = (req.params.id as any);
  const bookmarkIds = user.bookmarks.map((id: any) => id.toString());
  const has = bookmarkIds.includes(String(qid));
  if (has) {
    user.bookmarks = user.bookmarks.filter((id: any) => id.toString() !== String(qid)) as any;
  } else {
    user.bookmarks.push(qid);
  }
  await user.save();
  res.json({ bookmarks: user.bookmarks });
});

// My content endpoints
router.get('/me/questions', authRequired, async (req: Request, res: Response) => {
  const userId = (req as any).auth.userId;
  const list = await (Question as any).find({ author: userId }).sort({ createdAt: -1 });
  res.json(list);
});

router.get('/me/upvoted', authRequired, async (req: Request, res: Response) => {
  const userId = (req as any).auth.userId;
  const user = await (User as any).findById(userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const list = await (Question as any).find({ _id: { $in: user.upvoted } });
  res.json(list);
});

router.get('/me/downvoted', authRequired, async (req: Request, res: Response) => {
  const userId = (req as any).auth.userId;
  const user = await (User as any).findById(userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const list = await (Question as any).find({ _id: { $in: user.downvoted } });
  res.json(list);
});

router.get('/me/bookmarks', authRequired, async (req: Request, res: Response) => {
  const userId = (req as any).auth.userId;
  const user = await (User as any).findById(userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const list = await (Question as any).find({ _id: { $in: user.bookmarks } });
  res.json(list);
});

export default router;


