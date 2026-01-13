import { useEffect, useRef, useState } from "react";
import io, { Socket } from "socket.io-client";
import { useAuth } from "../context/AuthContext";
// IMPORTANT: simple-peer (and its deps) can reference Node-ish globals.
// To avoid blank-page crashes, load it lazily only when starting/answering a call.
type SimplePeerInstance = import("simple-peer").Instance;
type SimplePeerCtor = new (
  opts: import("simple-peer").Options,
) => SimplePeerInstance;

const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

interface UseSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
  onlineUsers: string[];
  callUser: (recipientId: string) => void;
  answerCall: () => void;
  endCall: () => void;
  callIncoming: { isReceiving: boolean; from: string; signal: any; isVideo: boolean } | null;
  callAccepted: boolean;
  callEnded: boolean;
  myVideo: React.RefObject<HTMLVideoElement>;
  userVideo: React.RefObject<HTMLVideoElement>;
  stream: MediaStream | null;
}

export function useSocket(): UseSocketReturn {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, _setOnlineUsers] = useState<string[]>([]);
  
  // Call state
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [callIncoming, setCallIncoming] = useState<any>(null);
  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);

  // Refs
  const myVideo = useRef<HTMLVideoElement>(null);
  const userVideo = useRef<HTMLVideoElement>(null);
  const connectionRef = useRef<SimplePeerInstance | null>(null);

  const loadPeer = async (): Promise<SimplePeerCtor | null> => {
    try {
      // simple-peer is commonly published as CJS (export = SimplePeer)
      // so dynamic import may yield either the module itself or { default: module }.
      const mod: any = await import("simple-peer");
      const Peer = (mod?.default ?? mod) as SimplePeerCtor;
      return Peer ?? null;
    } catch (error) {
      console.error("Video calls unavailable: failed to load simple-peer", error);
      return null;
    }
  };

  useEffect(() => {
    if (!user.isLoggedIn || !user.email) return;

    // Connect
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    newSocket.on("connect", () => {
      setIsConnected(true);
      // Join my own room for signaling
      // Assuming user has an ID field, or map email -> ID on server.
      // Ideally user object has userId. Let's assume user.id or we fetch profile.
      // For demo, we assume user auth context provides ID which usually it does.
      if ((user as any).id) {
          newSocket.emit("join_user", (user as any).id);
      }
    });

    newSocket.on("disconnect", () => setIsConnected(false));

    newSocket.on("incoming_call", (data) => {
      setCallIncoming({ isReceiving: true, from: data.from, signal: data.signal, isVideo: data.isVideo });
    });

    return () => {
      newSocket.disconnect();
    };
  }, [user.isLoggedIn]);

  // Video Call Logic
  const enableStream = async () => {
      try {
        const currentStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
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
    if (!currentStream || !socket || !(user as any).id) return;

    const Peer = await loadPeer();
    if (!Peer) return;

    const peer = new Peer({ initiator: true, trickle: false, stream: currentStream });

    peer.on("signal", (data: unknown) => {
      socket.emit("call_user", {
        callerId: (user as any).id,
        recipientId,
        signalData: data,
        isVideo: true
      });
    });

    peer.on("stream", (remoteStream: MediaStream) => {
        if (userVideo.current) {
            userVideo.current.srcObject = remoteStream;
        }
    });

    socket.on("call_accepted", (signal: unknown) => {
        setCallAccepted(true);
      peer.signal(signal as any);
    });

    connectionRef.current = peer;
  };

  const answerCall = async () => {
      const currentStream = await enableStream();
      if (!currentStream || !socket || !callIncoming) return;

      const Peer = await loadPeer();
      if (!Peer) return;

      setCallAccepted(true);
      const peer = new Peer({ initiator: false, trickle: false, stream: currentStream });

        peer.on("signal", (data: unknown) => {
          socket.emit("answer_call", { signal: data, to: callIncoming.from });
      });

        peer.on("stream", (remoteStream: MediaStream) => {
          if (userVideo.current) {
              userVideo.current.srcObject = remoteStream;
          }
      });

        peer.signal(callIncoming.signal as any);
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
    stream
  };
}
