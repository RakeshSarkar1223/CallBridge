import { createServer } from "node:http";
import { Server } from "socket.io";
import type { Express } from "express";

import { registerRoomHandlers } from "./room.ts";
import { registerMessageHandlers } from "./message.ts";
import { registerMeetingHandlers } from "./meeting.ts";

export const connect = (app: Express) => {
  const server = createServer(app);

  const allowedOrigin = process.env.FRONTEND_URL;
  const io = new Server(server, {
    cors: {
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (!allowedOrigin) return callback(null, false);
        
        const cleanAllowed = allowedOrigin.replace(/\/$/, "");
        const cleanOrigin = origin.replace(/\/$/, "");
        
        if (cleanOrigin === cleanAllowed || (process.env.NODE_ENV !== "production" && cleanOrigin.startsWith("http://localhost:"))) {
          callback(null, true);
        } else {
          callback(null, false);
        }
      },
      credentials: true,
    },
  });

  console.log("Web Server Connected");

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    registerRoomHandlers(io, socket);

    registerMessageHandlers(io, socket);

    registerMeetingHandlers(io, socket);

    socket.on("disconnect", (reason) => {
      console.log(
        `User disconnected: ${socket.id}, reason: ${reason}`,
      );
    });
  });

  return { server, io };
};