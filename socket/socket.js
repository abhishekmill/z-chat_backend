import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Map to store connected users and their socket IDs
const userSocketMap = {};

// Function to get the receiver's socket ID from userSocketMap
const getReciverSocketId = (receiverId) => {
  return userSocketMap[receiverId];
};

// Socket.IO connection handler
io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;

  console.log(`User:${userId} is connected: ${socket.id}`);

  // Get userId from the socket handshake query

  if (userId !== undefined) {
    userSocketMap[userId] = socket.id;
    // console.log(`User ${userId} connected with socket ID: ${socket.id}`);
  }

  // Emit the list of online users to all clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // Listen for 'sendMessage' event
  socket.on("sendMessage", ({ senderId, receiverId, message }) => {
    const receiverSocketId = getReciverSocketId(receiverId);
    console.log(message);

    if (receiverId) {
      // Send message to the receiver's socket
      io.emit("receiveMessage", { message, receiverId, senderId });
      console.log(`Message from to ${receiverId}: ${message}`);

      //  if (receiverSocketId) {
      //    // Send the message to Client 2's socket
      //    io.to(receiverSocketId).emit("receiveMessage", { senderId, message });
      //    console.log(`Message from ${senderId} to ${receiverId}: ${message}`);
      //  }
    } else {
      console.log(`Receiver ${receiverId} not connected.`);
    }
  });

  // Handle user disconnection
  socket.on("disconnect", () => {
    if (userId) {
      delete userSocketMap[userId];
      console.log(`User ${userId} disconnected.`);
    }
    // Emit updated list of online users
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { app, io, server, getReciverSocketId };
