/**
 * Socket Service
 * Manages the singleton Socket.IO client connection to the backend.
 * Centralised here so any component can import the same instance.
 */

import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL ?? 'http://localhost:5000';

let socket: Socket | null = null;

/** Returns the existing socket or creates a fresh one. */
export function getSocket(): Socket {
  if (!socket || socket.disconnected) {
    socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: false,
      reconnectionAttempts: 3,
      reconnectionDelay: 1000,
    });
  }
  return socket;
}

/** Cleanly terminate the socket connection. */
export function destroySocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
