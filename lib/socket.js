import { io } from "socket.io-client";

let socket = null;

export function getSocket(token) {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_BACKEND_URL, {
      transports: ["websocket"],
      withCredentials: true,
      auth: {
        token,
      },
    });
  }

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
