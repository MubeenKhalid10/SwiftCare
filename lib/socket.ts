import { io, Socket } from "socket.io-client";
import { getAccessToken } from "./auth.service";

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

let socketInstance: Socket | null = null;

function initializeSocket(): Socket {
  if (socketInstance) {
    return socketInstance;
  }

  let newSocket = io(SOCKET_URL, {
    withCredentials: true,
    autoConnect: false,
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
  });

  // Attach token dynamically on connect to ensure we have the latest token
  newSocket.on("connect_attempt", () => {
    const token = getAccessToken();
    if (token) {
      newSocket.auth = { token };
    }
  });

  newSocket.on("disconnect", (reason) => {
    console.log("[v0] Socket disconnected:", reason);
  });

  socketInstance = newSocket;
  return socketInstance;
}

export const socket = initializeSocket();

/**
 * Connect socket with current access token
 */
export function connectSocket(): void {
  if (socket) {
    const token = getAccessToken();
    if (token) {
      socket.auth = { token };
    }
    socket.connect();
  }
}

/**
 * Disconnect socket
 */
export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
  }
}
