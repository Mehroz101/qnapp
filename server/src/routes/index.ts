import { Router, Request, Response } from 'express';
import { env } from '../config/env';
import realAuthRoutes from './authRoutes';
import qnaRoutes from './qnaRoutes';
import fs from 'fs';
import path from 'path';
import { Question } from '../models/Question';

const api = Router();

api.get('/health', (_req: Request, res: Response) => {
  res.json({ ok: true, mock: env.useMockApi });
});


api.use('/auth', realAuthRoutes);
api.use('/qna', qnaRoutes);



