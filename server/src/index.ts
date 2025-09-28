import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { connectMongo } from './lib/mongo.js';
import AuthRouter from './routes/authRoutes.js';
import QnaRouter from './routes/qnaRoutes.js';
import serverless from "@vendia/serverless-express";
import dotenv from 'dotenv';

dotenv.config();

const app = express();


app.use(cors({ origin: process.env.CLIENT_ORIGIN, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

app.use("/api/auth", AuthRouter);
app.use("/api/qna", QnaRouter);

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});
app.get("/", (_req, res) => {
  res.send("server is running");
});

// Normal server (for local dev)
connectMongo()
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log(`✅ API listening on http://localhost:${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Failed to start server', err);
    process.exit(1);
  });

// Lambda handler (for serverless deployment)
export default serverless({ app });
