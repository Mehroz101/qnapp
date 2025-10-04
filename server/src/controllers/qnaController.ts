import { Request, Response } from 'express';
import { qnaService } from '../services/qnaService.js';
import { z } from 'zod';
import { generateWithAI } from '../services/aiService.js';

const createQuestionSchema = z.object({
  question: z.string().min(3),
  answer: z.string().min(3),
  category: z.string().min(3),
  company: z.string().min(2),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  interviewType: z.enum(['behavioral', 'technical', 'hr', 'other']),
});

export const qnaController = {
  async createQuestion(req: Request, res: Response) {
    const parsed = createQuestionSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.issues });
    const userId = (req as any).auth.userId;
    const q = await qnaService.createQuestion({ ...parsed.data, author: userId });
    res.status(201).json(q);
  },

 async listQuestions(req: Request, res: Response) {
  try {
    const userId = (req as any).auth?.userId;
    console.log("Query:", req.query);

    const list = userId
      ? await qnaService.listQuestions(userId, req.query)
      : await qnaService.listQuestions(undefined, req.query);

    res.json(list);
  } catch (err: any) {
    console.error("Error in listQuestions:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch questions",
    });
  }
},


  async getQuestionDetail(req: Request, res: Response) {
    const q = await qnaService.getQuestionDetail(req.params.id ?? '');
    if (!q) return res.status(404).json({ error: 'Not found' });
    res.json(q);
  },

  async updateQuestion(req: Request, res: Response) {
    const userId = (req as any).auth.userId;
    const q = await qnaService.updateQuestion(req.params.id ?? '', userId, req.body);
    if (!q) return res.status(404).json({ error: 'Not found or not owner' });
    res.json(q);
  },

  async deleteQuestion(req: Request, res: Response) {
    const userId = (req as any).auth.userId;
    const q = await qnaService.deleteQuestion(req.params.id ?? '', userId);
    if (!q) return res.status(404).json({ error: 'Not found or not owner' });
    res.json({ ok: true });
  },

  async answerQuestion(req: Request, res: Response) {
    const userId = (req as any).auth.userId;
    const parsed = z.object({ text: z.string().min(1) }).safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.issues });
    const q = await qnaService.answerQuestion(req.params.id ?? '', userId, parsed.data.text);
    if (!q) return res.status(404).json({ error: 'Not found' });
    res.status(201).json(q);
  },

  async upvote(req: Request, res: Response) {
    const userId = (req as any).auth.userId;
    const result = await qnaService.upvote(req.params.id ?? '', userId);
    if (!result) return res.status(404).json({ error: 'Not found' });
    res.json(result);
  },

  async downvote(req: Request, res: Response) {
    const userId = (req as any).auth.userId;
    const result = await qnaService.downvote(req.params.id ?? '', userId);
    if (!result) return res.status(404).json({ error: 'Not found' });
    res.json(result);
  },

  async bookmark(req: Request, res: Response) {
    const userId = (req as any).auth.userId;
    const result = await qnaService.bookmark(req.params.id ?? '', userId);
    if (!result) return res.status(404).json({ error: 'User not found' });
    res.json(result);
  },

  async myQuestions(req: Request, res: Response) {
    const userId = (req as any).auth.userId;
    const list = await qnaService.myQuestions(userId);
    res.json(list);
  },

  async myUpvoted(req: Request, res: Response) {
    const userId = (req as any).auth.userId;
    const list = await qnaService.myUpvoted(userId);
    res.json(list);
  },

  async myDownvoted(req: Request, res: Response) {
    const userId = (req as any).auth.userId;
    const list = await qnaService.myDownvoted(userId);
    res.json(list);
  },

  async myBookmarks(req: Request, res: Response) {
    const userId = (req as any).auth.userId;
    const list = await qnaService.myBookmarks(userId);
    res.json(list);
  },
  async viewQuestion(req: Request, res: Response) {
    const question = await qnaService.viewQuestion(req.body ?? '');
    if (!question) return res.status(404).json({ error: 'Not found' });
    res.json(question);
  },
  async getCategories(req: Request, res: Response) {
    const categories = await qnaService.getCategories();
    res.json(categories);
  },
  async generateWithAI(req: Request, res: Response) {
    const userId = (req as any).auth.userId;
    console.log("prompt received:", req.body.prompt);
    const prompt = req.body.prompt as string || 'Generate a random interview question';
    try {
      const generatedQuestion = await generateWithAI(prompt, userId);
      return res.json({ ok: true, question: generatedQuestion });
    } catch (error) {
      res.status(500).json({ error: 'Failed to generate question' });
    }
  }

}
