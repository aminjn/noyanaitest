"use client";

import { useEffect, useState } from "react";
import useSocket from "../Hooks/useSocket";
import { checkPendingIncomingCalls } from "./CallClient";
import IncomingCallBox, { IncomingCall } from "./IncomingCallBox";

const CallManager = () => {
  const socket = useSocket();

  const [incomingCall, setIncomingCall] = useState<IncomingCall | null>(null);

  useEffect(() => {
    const onIncoming = (payload: IncomingCall) => setIncomingCall(payload);
    // The ring can time out (or everyone else already rejected) while it's
    // still showing for this user - drop the box instead of leaving a stale
    // "someone's calling" notification up once it no longer means anything.
    const onCancelled = (payload: { roomId: string }) =>
      setIncomingCall((prev) =>
        prev?.roomId === payload.roomId ? null : prev,
      );
    const onConnect = () => checkPendingIncomingCalls(socket);

    socket.on("call:incoming", onIncoming);
    socket.on("call:cancelled", onCancelled);
    socket.on("connect", onConnect);
    // The socket may already be connected by the time this effect runs
    // (it's created once, module-level, and starts connecting immediately -
    // well before this component mounts) - in that case "connect" already
    // fired and never will again, so check explicitly here too. Otherwise
    // onConnect above picks it up once "connect" actually fires.
    if (socket.connected) checkPendingIncomingCalls(socket);

    return () => {
      socket.off("call:incoming", onIncoming);
      socket.off("call:cancelled", onCancelled);
      socket.off("connect", onConnect);
    };
  }, [socket]);

  if (!incomingCall) return null;

  return (
    <IncomingCallBox
      call={incomingCall}
      onDismiss={() => setIncomingCall(null)}
    />
  );
};

export default CallManager;
