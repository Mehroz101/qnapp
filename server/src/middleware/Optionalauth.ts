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

/**
 * Optional auth middleware:
 *  - If no Authorization header -> proceed (unauthenticated user).
 *  - If valid token -> attaches decoded payload to req.auth.
 *  - If invalid token -> 401 error.
 */
export function authOptional(req: Request, res: Response, next: NextFunction) {
  const header = req.header("Authorization");

  // No token at all: just move on, no auth info.
  if (!header || !header.startsWith("Bearer ")) {
    return next();
  }

  const token = header.slice("Bearer ".length).trim();

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET environment variable is not defined");
    }

    const decoded = jwt.verify(token, secret) as AuthPayload;
    (req as any).auth = decoded; // attach payload if valid
    return next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
}