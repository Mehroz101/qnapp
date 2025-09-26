import express, { Request, Response } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { env } from './config/env';
import { connectMongo } from './lib/mongo';
import AuthRouter from './routes/authRoutes';
import QnaRouter from './routes/qnaRoutes';
import path from 'path';
import { Question } from './models/Question';
import fs from 'fs';

const app = express();

app.use(cors({ origin: env.clientOrigin, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));
app.post('/qna/seed', async (_req: Request, res: Response) => {
  try {
    const filePath = path.join(__dirname, './data/questionsSeed.json');
    const raw = fs.readFileSync(filePath, 'utf-8');
    const questions = JSON.parse(raw);
    const inserted = await Question.insertMany(questions);
    res.json({ ok: true, count: inserted.length });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.use("/api/auth",AuthRouter)
app.use("/api/qna",QnaRouter)
app.get("/health",(_req,res)=>{
  res.json({ok:true})
})
connectMongo()
  .then(() => {
    app.listen(env.port, () => {
      console.log(`API listening on http://localhost:${env.port}`);
    });
  })
  .catch((err) => {
    console.error('Failed to start server', err);
    process.exit(1);
  });


