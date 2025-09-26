import { Request, Response } from 'express';
import { questionsService } from '../services/questionsService';

function getStringParam(param: unknown): string | undefined {
  if (typeof param === 'string') return param;
  if (Array.isArray(param) && param.length > 0 && typeof param[0] === 'string') return param[0];
  return undefined;
}
function getStringArrayParam(param: unknown): string[] | undefined {
  if (Array.isArray(param)) return param.filter((v) => typeof v === 'string');
  if (typeof param === 'string') return [param];
  return undefined;
}

export const questionsController = {
  async list(req: Request, res: Response) {
    const search = getStringParam(req.query.search) ?? '';
    const categories = getStringArrayParam(req.query.categories) ?? [];
    const sortBy = getStringParam(req.query.sortBy) ?? '';
    const result = await questionsService.list({ search, categories, sortBy });
    res.json(result);
  },
  async add(req: Request, res: Response) {
    const userId = (req as any).auth?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const result = await questionsService.add({ ...req.body, author: userId });
    res.status(201).json(result);
  },
  async upvote(req: Request, res: Response) {
    const userId = (req as any).auth?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const id = typeof req.params.id === 'string' ? req.params.id : '';
    const result = await questionsService.upvote(id, userId);
    res.json(result);
  },
  async downvote(req: Request, res: Response) {
    const userId = (req as any).auth?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const id = typeof req.params.id === 'string' ? req.params.id : '';
    const result = await questionsService.downvote(id, userId);
    res.json(result);
  },
  async bookmark(req: Request, res: Response) {
    const userId = (req as any).auth?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const id = typeof req.params.id === 'string' ? req.params.id : '';
    const result = await questionsService.bookmark(id, userId);
    res.json(result);
  },
};
