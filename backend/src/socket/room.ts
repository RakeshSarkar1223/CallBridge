import { Server, Socket } from "socket.io";
import Room from "../model/room.model.ts";

export const registerRoomHandlers = (io: Server, socket : Socket) => {
  // Create Room
  socket.on("create-room", async ({ roomName, email }) => {
    try {
      if (!roomName?.trim()) {
        socket.emit("create-room-error", "Room name is required");
        return;
      }

      const roomId = `room-${Date.now()}`;

      const room = await Room.create({
        roomId,
        roomName,
        createdBy: email,
        participants: [email], // Creator automatically joins the room
      });

      socket.join(roomId);

      socket.emit("room-created", room);

      // If you want every connected user to immediately
      // see the new room in their sidebar, replace the line above with:
      // io.emit("room-created", room);

    } catch (error: any) {
      console.error(error);
      socket.emit("create-room-error", "Unable to create room");
    }
  });

  // Join Room
  socket.on("join-room", async ({ roomID, userName }) => {
    try {
      if (!roomID?.trim()) {
        socket.emit("join-room-error", "Room ID is required");
        return;
      }

      const room = await Room.findOne({ roomId: roomID });

      if (!room) {
        socket.emit("join-room-error", "Invalid Room ID");
        return;
      }

      if (!room.participants.includes(userName)) {
        room.participants.push(userName);
        await room.save();
      }

      socket.join(roomID);

      socket.emit("joined-room", room);

    } catch (error: any) {
      console.error(error);
      socket.emit("join-room-error", "Unable to join room");
    }
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected(room): ${socket.id}`);
  });

};