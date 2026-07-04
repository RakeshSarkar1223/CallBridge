import { Server } from "socket.io";
import Room from "../model/room.model.ts";
import Message from "../model/message.model.ts";

export const registerMessageHandlers = (io: Server) => {
  io.on("connection", (socket) => {
    console.log(`User connected(message): ${socket.id}`);

    // Join a chat room
    socket.on("join-chat-room", async ({ roomId }) => {
      try {
        const room = await Room.findOne({
          roomId,
        });

        if (!room) {
          socket.emit("message-error", "Room not found");
          return;
        }

        socket.join(roomId);

        console.log(`${socket.id} joined room ${roomId}`);
      } catch (error) {
        console.error(error);

        socket.emit("message-error", "Unable to join chat room");
      }
    });

    // Leave a chat room
    socket.on("leave-chat-room", ({ roomId }) => {
      socket.leave(roomId);

      console.log(`${socket.id} left room ${roomId}`);
    });

    // Send message
    socket.on("send-message", async ({ roomId, msg, sender }) => {
      try {
        const trimmedMessage = msg?.trim();

        if (!trimmedMessage) {
          socket.emit("message-error", "Message cannot be empty");
          return;
        }

        const room = await Room.findOne({
          roomId,
        });

        if (!room) {
          socket.emit("message-error", "Room not found");
          return;
        }

        // Make sure sender is actually a participant
        if (!room.participants.includes(sender)) {
          socket.emit("message-error", "You are not a member of this room");

          return;
        }

        // Save message first
        const savedMessage = await Message.create({
          roomId: room._id,
          sender,
          msg: trimmedMessage,
        });

        // Send saved message to everyone in the room,
        // including the sender.
        io.to(roomId).emit("receive-message", savedMessage);
      } catch (error) {
        console.error(error);

        socket.emit("message-error", "Unable to send message");
      }
    });

    socket.on("disconnect", () => {
      console.log(`User disconnected(message): ${socket.id}`);
    });
  });
};
