import { createServer } from 'node:http';
import { Server } from 'socket.io';
import type { Express } from 'express';
import { registerRoomHandlers } from './room.ts';
import { registerMessageHandlers } from './message.ts';

export const connect = (app : Express) => {
    const server = createServer(app);
    const io =  new Server(server, {
        cors:{
            origin:"http://localhost:5000",
            credentials:true
        }
    });
    console.log("Web Server Connected");
    
    // Register socket handlers
    registerRoomHandlers(io);
    registerMessageHandlers(io);

    return {server, io};
}