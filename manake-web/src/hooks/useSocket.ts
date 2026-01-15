import { useEffect, useRef, useState } from "react";
import io, { Socket } from "socket.io-client";
import { useAuth } from "../context/AuthContext";
// IMPORTANT: simple-peer (and its deps) can reference Node-ish globals.
// To avoid blank-page crashes, load it lazily only when starting/answering a call.
type SimplePeerInstance = import("simple-peer").Instance;
type SimplePeerCtor = new (
  opts: import("simple-peer").Options,
) => SimplePeerInstance;
type SignalData = import("simple-peer").SignalData;

const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

interface UseSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
  onlineUsers: string[];
  callUser: (recipientId: string) => void;
  answerCall: () => void;
  endCall: () => void;
  callIncoming: CallIncoming | null;
  callAccepted: boolean;
  callEnded: boolean;
  myVideo: React.RefObject<HTMLVideoElement | null>;
  userVideo: React.RefObject<HTMLVideoElement | null>;
  stream: MediaStream | null;
}

interface CallIncoming {
  isReceiving: boolean;
  from: string;
  signal: SignalData;
  isVideo: boolean;
}

export function useSocket(): UseSocketReturn {
  const { user } = useAuth();
  const userId = (user as { id?: string }).id;
  const isLoggedIn = user.isLoggedIn;
  const userEmail = user.email;
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  // Call state
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [callIncoming, setCallIncoming] = useState<CallIncoming | null>(null);
  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);

  // Refs
  const myVideo = useRef<HTMLVideoElement | null>(null);
  const userVideo = useRef<HTMLVideoElement | null>(null);
  const connectionRef = useRef<SimplePeerInstance | null>(null);

  const loadPeer = async (): Promise<SimplePeerCtor | null> => {
    try {
      // simple-peer is commonly published as CJS (export = SimplePeer)
      // so dynamic import may yield either the module itself or { default: module }.
      const mod = (await import("simple-peer")) as
        | { default?: SimplePeerCtor }
        | SimplePeerCtor;
      const Peer = (typeof mod === "function" ? mod : mod.default) as
        | SimplePeerCtor
        | undefined;
      return Peer ?? null;
    } catch (error) {
      console.error(
        "Video calls unavailable: failed to load simple-peer",
        error,
      );
      return null;
    }
  };

  useEffect(() => {
    if (!isLoggedIn || !userEmail) return;

    // Connect
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    newSocket.on("connect", () => {
      setIsConnected(true);
      // Join my own room for signaling
      // Assuming user has an ID field, or map email -> ID on server.
      // Ideally user object has userId. Let's assume user.id or we fetch profile.
      // For demo, we assume user auth context provides ID which usually it does.
      if (userId) {
        newSocket.emit("join_user", userId);
      }
    });

    newSocket.on("disconnect", () => setIsConnected(false));

    newSocket.on(
      "incoming_call",
      (data: { from: string; signal: SignalData; isVideo: boolean }) => {
        setCallIncoming({
          isReceiving: true,
          from: data.from,
          signal: data.signal,
          isVideo: data.isVideo,
        });
      },
    );

    newSocket.on("online_users", (users: string[]) => {
      setOnlineUsers(users);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [isLoggedIn, userEmail, userId]);

  // Video Call Logic
  const enableStream = async () => {
    try {
      const currentStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setStream(currentStream);
      if (myVideo.current) {
        myVideo.current.srcObject = currentStream;
      }
      return currentStream;
    } catch (err) {
      console.error("Failed to get media", err);
      return null;
    }
  };

  const callUser = async (recipientId: string) => {
    const currentStream = await enableStream();
    if (!currentStream || !socket || !userId) return;

    const Peer = await loadPeer();
    if (!Peer) return;

    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream: currentStream,
    });

    peer.on("signal", (data: unknown) => {
      socket.emit("call_user", {
        callerId: userId,
        recipientId,
        signalData: data,
        isVideo: true,
      });
    });

    peer.on("stream", (remoteStream: MediaStream) => {
      if (userVideo.current) {
        userVideo.current.srcObject = remoteStream;
      }
    });

    socket.on("call_accepted", (signal: SignalData) => {
      setCallAccepted(true);
      peer.signal(signal);
    });

    connectionRef.current = peer;
  };

  const answerCall = async () => {
    const currentStream = await enableStream();
    if (!currentStream || !socket || !callIncoming) return;

    const Peer = await loadPeer();
    if (!Peer) return;

    setCallAccepted(true);
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream: currentStream,
    });

    peer.on("signal", (data: unknown) => {
      socket.emit("answer_call", { signal: data, to: callIncoming.from });
    });

    peer.on("stream", (remoteStream: MediaStream) => {
      if (userVideo.current) {
        userVideo.current.srcObject = remoteStream;
      }
    });

    peer.signal(callIncoming.signal);
    connectionRef.current = peer;
  };

  const endCall = () => {
    setCallEnded(true);
    if (connectionRef.current) {
      connectionRef.current.destroy();
    }
    // Notify other user?
  };

  return {
    socket,
    isConnected,
    onlineUsers,
    callUser,
    answerCall,
    endCall,
    callIncoming,
    callAccepted,
    callEnded,
    myVideo,
    userVideo,
    stream,
  };
}
