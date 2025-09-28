import express from "express";
import cors from "cors";
import morgan from "morgan";
import { connectMongo } from "./lib/mongo.js";
import AuthRouter from "./routes/authRoutes.js";
import QnaRouter from "./routes/qnaRoutes.js";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use((req, res, next) => {
  console.log("Incoming request from:", req.headers.origin);
  console.log("ENV :", process.env.CLIENT_ORIGIN);
  next();
});
const allowedOrigins = [
  process.env.CLIENT_ORIGIN,
  "https://qwizzy-zeta.vercel.app/", // local dev
  "https://qwizzy-hcs9xw9p4-mehrozs-projects-d1b57550.vercel.app/", // prod,
  "https://qwizzy-git-main-mehrozs-projects-d1b57550.vercel.app",
  "https://qwizzy-2ewiupg17-mehrozs-projects-d1b57550.vercel.app",
];
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

app.use("/api/auth", AuthRouter);
app.use("/api/qna", QnaRouter);

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.get("/", (_req, res) => {
  res.send("server is running");
});
connectMongo();

// Local dev server (only runs outside Vercel)
if (process.env.NODE_ENV !== "production") {
  app.listen(process.env.PORT || 3000, () => {
    console.log(
      `✅ API listening on http://localhost:${process.env.PORT || 3000}`
    );
  });
}

// Vercel picks up this Express app automatically
export default app;
