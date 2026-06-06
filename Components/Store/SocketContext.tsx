"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Socket } from "socket.io-client";
import { io } from "socket.io-client";
import useNotification from "../Hooks/useNotification";
import useLocale from "../Hooks/useLocale";

type SocketContextType = { socket: Socket; reconnect: () => void };

const _socket = io("/", {
  path: `/api/socket.io`,
  transports: ["websocket"],
});

const SocketContext = createContext<SocketContextType>({
  socket: _socket,
  reconnect: () => {
    _socket.disconnect();
    _socket.connect();
  },
});

export const SockectContextProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const pushNotification = useNotification();

  const getContent = useLocale();

  const socketRef = useRef<Socket>(_socket);

  const reconnect = useCallback(() => {
    socketRef.current.disconnect();
    socketRef.current.connect();
  }, []);

  useEffect(() => {
    const current = socketRef.current;
    current.on("error", (data: unknown) => {
      pushNotification(
        typeof data === "string" ? data : getContent("unknownErrorOccured"),
        "Error",
      );
    });
    return () => {
      current.off("error");
    };
  }, [getContent, pushNotification]);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, reconnect }}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContext;
