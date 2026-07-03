import jwt from "jsonwebtoken";
import "dotenv/config";

export const generateToken = (email: string): string => {
  return jwt.sign(
    { email },
    process.env.JWT_SECRET!,
    {
      expiresIn: "1d",
    }
  );
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, process.env.JWT_SECRET!);
};