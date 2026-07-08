import type { Request, Response } from "express";
import {
  addUser,
  loginUser as loginUserService,
  getUserS
} from "../service/user.service.ts";
// import { use } from "passport";

// Shared cookie options to keep things DRY (Don't Repeat Yourself)
const isProd = process.env.NODE_ENV === "production";
const cookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite:  (isProd ? "none" : "lax") as "none" | "lax" ,
  maxAge: 24 * 60 * 60 * 1000, // 1 day
};

export const registerUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { user, token } = await addUser(req.body);

    res.cookie("token", token, cookieOptions);
    res.status(201).json({
      success: true,
      user: user,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { user, token } = await loginUserService(req.body);

    res.cookie("token", token, cookieOptions);
    res.status(200).json({
      success: true,
      user,
    });
  } catch (error: any) {
    // If your service throws a specific status, use it; otherwise, default to 401 or 500
    const statusCode = error.status || 401; 
    res.status(statusCode).json({
      success: false,
      message: error.message,
    });
  }
};

export const logoutUser = async (req: Request, res: Response): Promise<void> => {
  // Clear cookie requires the same options (minus maxAge/expires) to work reliably
  res.clearCookie("token", {
    httpOnly: cookieOptions.httpOnly,
    secure: cookieOptions.secure,
    sameSite: cookieOptions.sameSite,
  });
  
  res.status(200).json({ 
    success: true,
    message: "User logged out successfully" 
  });
};

export const getUser = async (req : Request, res : Response) => {
    try {
        const {token} = req.cookies ;
        if(!token) {
            res.status(400).json({message : "No current user found"});
            return;
        }
        const user = await getUserS(token);
        res.status(200).json({
            success: true,
            user: user
        })
        
    } catch (error : any) {
        res.status(500).json({
            success : false,
            message: error.message
        })
    }
}