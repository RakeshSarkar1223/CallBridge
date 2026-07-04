import { verifyToken } from "../utils/jwt.ts";
import type { Request, Response } from "express";
declare global {
  namespace Express {
    interface Request {
      user?: string;
    }
  }
}
import status from "http-status";
import type { JwtPayload } from "jsonwebtoken";

export default (req: Request, res: Response, next: any) => {
  const { token } = req.cookies;
  if (!token) {
    res.status(status.BAD_REQUEST).json({
      message: "Login first",
    });
    return;
  }
  const decoded = verifyToken(token) as JwtPayload;
  req.user = decoded.email;
  next();
};
