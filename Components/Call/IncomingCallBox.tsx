"use client";

import { useState } from "react";
import { CallApi, CallType } from "./CallClient";
import useProgress from "../Hooks/useProgress";
import useNotification from "../Hooks/useNotification";
import Button from "../UI/Button";
import Ixon from "../UI/Ixon";
import CallingIcon from "../Icons/CallingIcon";
import CloseIcon from "../Icons/CloseIcon";
import classes from "./IncomingCallBox.module.css";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentKey } from "../Enums/contentKeys";

export type IncomingCall = {
  roomId: string;
  callType: CallType;
  initiator: string;
  initiatorPhone?: string;
  initiatorUsername?: string;
};

const callTypeLabel: Record<CallType, ContentKey> = {
  voice: "voiceCall",
  video: "videoCall",
};

const IncomingCallBox = ({
  call,
  onDismiss,
}: {
  call: IncomingCall;
  onDismiss: () => void;
}) => {
  const push = useProgress();
  const pushNotification = useNotification();
  const [isBusy, setIsBusy] = useState(false);
  const getContent = useScopedLocale();

  const callerLabel =
    call.initiatorUsername || call.initiatorPhone || getContent("unknownUser");

  const handleAnswer = () => {
    if (isBusy) return;
    setIsBusy(true);
    // Best-effort UX nicety - actually joining the media happens on the
    // call room page over the socket (call:join), so we don't wait on this.
    CallApi.answer(call.roomId).catch(() => {});
    onDismiss();
    push(`/dashboard/call/${call.roomId}`);
  };

  const handleReject = () => {
    if (isBusy) return;
    setIsBusy(true);
    CallApi.reject(call.roomId)
      .catch((err: Error) => pushNotification(err.message, "Error"))
      .finally(() => {
        setIsBusy(false);
        onDismiss();
      });
  };

  return (
    <div className={classes.main}>
      <div className={classes.info}>
        <span className={`${classes.icon} glassIcon tone-teal`}>
          <Ixon width="1.25rem">
            <CallingIcon />
          </Ixon>
        </span>
        <div className={classes.text}>
          <span className={classes.caller}>{callerLabel}</span>
          <span className={classes.type}>{getContent(callTypeLabel[call.callType])}</span>
        </div>
      </div>
      <div className={classes.actions}>
        <Button
          variant="Success"
          size="S"
          radius="High"
          isLoading={isBusy}
          onClick={handleAnswer}
          leadIcon={<CallingIcon />}
        >
          {getContent("answer")}
        </Button>
        <Button
          variant="Error"
          size="S"
          radius="High"
          isLoading={isBusy}
          onClick={handleReject}
          leadIcon={<CloseIcon />}
        >
          {getContent("declineCall")}
        </Button>
      </div>
    </div>
  );
};

export default IncomingCallBox;
