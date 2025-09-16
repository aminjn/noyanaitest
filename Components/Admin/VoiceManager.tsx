import { io } from "socket.io-client";
import { API } from "../config";
import { useEffect } from "react";
import useSocket from "../Hooks/useSocket";
import PopupCard from "../UI/PopupCard";
import Button from "../UI/Button";

const VoiceManager = () => {
  const socket = useSocket();

  return (
    <PopupCard>
      <Button onClick={() => socket?.emit("fart")}>Fart</Button>
    </PopupCard>
  );
};

export default VoiceManager;
