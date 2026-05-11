"use client";
import { useEffect, useState } from "react";
import classes from "./NewCallPage.module.css";
import JoinRoom from "./JoinRoom";
import RoomPage from "./RoomPage";

const NewCallPage = () => {
  const [room, setRoom] = useState<string | null>(null);
  const [isServer, setIsServer] = useState<boolean>(true);
  useEffect(() => {
    setIsServer(false);
  }, []);

  if (isServer) return null;
  if (!room) return <JoinRoom onSuccess={(roomName) => setRoom(roomName)} />;
  return <RoomPage roomName={room} />;
};

export default NewCallPage;
