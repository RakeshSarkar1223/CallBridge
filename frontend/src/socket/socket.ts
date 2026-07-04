import { io } from "socket.io-client";

export const socket = io("http://localhost:5005", {
    autoConnect: true,
    reconnectionDelayMax: 10000
});