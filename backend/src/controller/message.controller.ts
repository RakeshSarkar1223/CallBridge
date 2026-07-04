import type { Request, Response } from "express";
import status from "http-status";
import { getMessages } from "../service/message.service.ts";

export const getMessagesC = async (
  req: Request,
  res: Response
) => {
  try {
    const { roomId } = req.params;

    const messages = await getMessages(roomId as string);

    if (messages === null) {
      return res.status(status.NOT_FOUND).json({
        success: false,
        message: "Room not found",
      });
    }

    return res.status(status.OK).json({
      success: true,
      messages,
    });
  } catch (error: any) {
    console.error(error);

    return res.status(status.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Unable to load messages",
    });
  }
};