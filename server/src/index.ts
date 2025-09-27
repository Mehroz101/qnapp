import express from "express";
import cors from "cors";
import morgan from "morgan";
import { env } from "./config/env.js";
import { connectMongo } from "./lib/mongo.js";
import AuthRouter from "./routes/authRoutes.js";
import QnaRouter from "./routes/qnaRoutes.js";
import serverless from "@vendia/serverless-express";

const app = express();

app.use(cors({ origin: env.clientOrigin, credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

app.use("/api/auth", AuthRouter);
app.use("/api/qna", QnaRouter);

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

// ✅ Only start server locally
if (process.env.NODE_ENV !== "production") {
  connectMongo()
    .then(() => {
      app.listen(env.port, () => {
        console.log(`API listening on http://localhost:${env.port}`);
      });
    })
    .catch((err) => {
      console.error("Failed to start server", err);
      process.exit(1);
    });
}

// ✅ Export handler for Vercel
const handler = serverless({ app });
export default handler;
