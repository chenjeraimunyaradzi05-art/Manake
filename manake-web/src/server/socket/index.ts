import { Server as HttpServer } from "http";
import { Server as SocketIOServer, Socket } from "socket.io";
import { logger } from "../utils/logger";

interface CallData {
  callerId: string;
  recipientId: string;
  signalData: any;
  isVideo: boolean;
}

export function initSocketIO(httpServer: HttpServer) {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: "*", // Adjust for production
      methods: ["GET", "POST"],
    },
  });

  const onlineUsers = new Map<string, string>(); // userId -> socketId

  io.on("connection", (socket: Socket) => {
    logger.info(`Socket connected: ${socket.id}`);

    // Join user room for personal notifications/calls
    socket.on("join_user", (userId: string) => {
      socket.join(userId);
      onlineUsers.set(userId, socket.id);
      logger.info(`User ${userId} joined their room`);
      io.emit("user_status_change", { userId, status: "online" });
    });

    // Join conversation room
    socket.on("join_conversation", (conversationId: string) => {
      socket.join(conversationId);
      logger.info(`Socket ${socket.id} joined conversation ${conversationId}`);
    });

    // --- Messaging Events ---
    socket.on("send_message", (data: { conversationId: string; message: any }) => {
      // Broadcast to everyone in the conversation room (excluding sender if needed, but usually fine)
      io.to(data.conversationId).emit("new_message", data.message);
    });

    socket.on("typing", (data: { conversationId: string; userId: string; isTyping: boolean }) => {
        socket.to(data.conversationId).emit("user_typing", data);
    });


    // --- WebRTC Signaling (Video/Audio Calls) ---
    
    // 1. Caller initiates call
    socket.on("call_user", (data: CallData) => {
      const { recipientId } = data;
      logger.info(`Call initiated from ${data.callerId} to ${recipientId}`);
      
      // Emit to result user
      io.to(recipientId).emit("incoming_call", {
        signal: data.signalData,
        from: data.callerId,
        isVideo: data.isVideo,
      });
    });

    // 2. Recipient answers
    socket.on("answer_call", (data: { to: string; signal: any }) => {
      logger.info(`Call answered by ${socket.id} to ${data.to}`);
      io.to(data.to).emit("call_accepted", data.signal);
    });

    // 3. ICE Candidates (for connectivity)
    socket.on("ice_candidate", (data: { to: string; candidate: any }) => {
        io.to(data.to).emit("ice_candidate", { candidate: data.candidate });
    });
    
    // 4. End Call
    socket.on("end_call", (data: { to: string }) => {
        io.to(data.to).emit("call_ended");
    });


    socket.on("disconnect", () => {
      logger.info(`Socket disconnected: ${socket.id}`);
      // Find userId and remove
      for (const [uid, sid] of onlineUsers.entries()) {
          if (sid === socket.id) {
              onlineUsers.delete(uid);
              io.emit("user_status_change", { userId: uid, status: "offline" });
              break;
          }
      }
    });
  });

  return io;
}
