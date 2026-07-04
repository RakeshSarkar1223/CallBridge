import { allRooms, getRoom } from "../service/room.service.ts";
import type { Request, Response } from "express";
import status from "http-status";
export const allRoomsC = async (req : Request, res : Response) => {
    try {
        const email = req.user!;
        const rooms = await allRooms(email);
        res.status(status.OK).json({
            rooms: rooms,
            success: true
        });
    } catch (error : any) {
        console.log(error.message);
        res.status(status.INTERNAL_SERVER_ERROR).json({
            success: false
        })
    }
}

// room.controller.ts

export const getRoomById = async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;

    const room = await getRoom(roomId as string);

    if (!room) {
      return res.status(status.NOT_FOUND).json({
        success: false,
        message: "Invalid room ID",
      });
    }

    return res.status(status.OK).json({
      success: true,
      room,
    });
  } catch (error: any) {
    console.error(error);

    return res.status(status.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Error getting room",
    });
  }
};