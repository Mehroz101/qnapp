import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthPayload {
  userId: string;
}

export function signJwt(payload: AuthPayload) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET environment variable is not defined");
  }
  return jwt.sign(payload, secret, { expiresIn: "7d" });
}

export function authOptional(req: Request, res: Response, next: NextFunction) {
  const header = req.header("Authorization");
  if (!header || !header.startsWith("Bearer ")) {
    next();
    return;
  }
  const token = header.slice("Bearer ".length);
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET environment variable is not defined");
    }
    const decoded = jwt.verify(token, secret) as AuthPayload;
    (req as any).auth = decoded;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}
