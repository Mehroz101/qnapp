import { Router } from 'express';
import type { Express, Request, Response } from 'express';
import { env } from '../config/env';
import mockAuthRoutes from './mock/auth';
import mockQnaRoutes from './mock/qna';
import realAuthRoutes from './authRoutes';
import realQnaRoutes from './qnaRoutes';

  const api = Router();

  api.get('/health', (_req: Request, res: Response) => {
    res.json({ ok: true, mock: env.useMockApi });
  });

  if (env.useMockApi) {
    api.use('/auth', mockAuthRoutes);
    api.use('/qna', mockQnaRoutes);
  } else {
    api.use('/auth', realAuthRoutes);
    api.use('/qna', realQnaRoutes);
  }



