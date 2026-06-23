"use client";

import { io } from "socket.io-client";

let socket;

export const getSocket = () => {
  if (socket) return socket;
  // console.log(socket)

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/v1";
  const socketUrl = apiUrl.replace(/\/v1\/?$/, "");

  socket = io(socketUrl, {
    withCredentials: true,
    transports: ["websocket", "polling"],
  });

  return socket;
};
