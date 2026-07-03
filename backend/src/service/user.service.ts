import type { JwtPayload } from "jsonwebtoken";
import { prisma } from "../config/prisma.ts";
import { comparePassword, hashPassword } from "../utils/hash.ts";
import { generateToken, verifyToken } from "../utils/jwt.ts";

export interface CreateUserDto {
  name: string;
  email: string;
  phone?: string;
  password?: string;
  googleId?: string;
  avatar?: string;
  publicId?: string;
}
export const addUser = async (user: CreateUserDto) => {
  const existingUser = await prisma.user.findUnique({
    where: {
      email: user.email,
    },
  });

  if (existingUser) {
    throw new Error("User already exists");
  }

  const hashed = await hashPassword(user.password!);

  const newUser = await prisma.user.create({
    data: {
      name: user.name,
      email: user.email,
      phone: user.phone ?? null,
      password: hashed,
      googleId: user.googleId ?? null,
      avatar: user.avatar ?? null,
      publicId: user.publicId ?? null,
    },
  });

  const token = generateToken(newUser.email);

  const { password: _, ...safeUser } = newUser;

  return {
    user: safeUser,
    token,
  };
};

interface loginDTO {
  email: string;
  password: string;
}

export const loginUser = async (cred: loginDTO) => {
  const { email, password } = cred;

  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    throw new Error("Invalid Credentials");
  }

  const isMatch = await comparePassword(password, user.password as string);

  if (!isMatch) {
    throw new Error("Invalid Credentials");
  }

  const token = generateToken(user.email);

  const { password: _, ...safeUser } = user;

  return {
    user: safeUser,
    token,
  };
};

export const getUserS = async (token : string) => {
    const decoded =  verifyToken(token) as JwtPayload;
    if(!decoded){
        throw new Error("Invalid Credentials");
    }
    const user = await prisma.user.findUnique({
        where:{
            email: decoded.email
        }
    });
    if(!user){
        throw new Error("Invalid Credentials");
    }
    const {password: _, ...safeUser} = user;
    return safeUser;
}