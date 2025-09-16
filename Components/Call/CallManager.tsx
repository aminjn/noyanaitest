"use client";

import { useContext, useEffect } from "react";
import useSocket from "../Hooks/useSocket";
import usePopup from "../Hooks/usePopup";
import RingingPopup from "./RingingPopup";

const CallManager = () => {
  const socket = useSocket();

  const { setPopup } = usePopup();

  useEffect(() => {
    socket.on("ring", () => {
      setPopup("Ringing", <RingingPopup />);
    });
    return () => {
      socket.off("ring");
    };
  }, [setPopup, socket]);

  return <p>CallManager</p>;
};

export default CallManager;
