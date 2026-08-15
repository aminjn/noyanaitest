"use client";
import CreateForm from "@/Components/Admin/UI/CreateForm";
import { CallClient, ICallParticipant } from "@/Components/Call/CallClient";
import { API } from "@/Components/config";
import { IBooking } from "@/Components/DoctorPanel/Calendar/DoctorCalendarDay";
import useProgress from "@/Components/Hooks/useProgress";
import useSocket from "@/Components/Hooks/useSocket";
import useUser, { IUser, MongoDoc } from "@/Components/Hooks/useUser";
import Button from "@/Components/UI/Button";
import Form from "@/Components/UI/Form";
import { useEffect, useMemo, useState } from "react";

export const callTypes = ["voice", "video"] as const;

export type CallType = (typeof callTypes)[number];

// "adhoc": started directly between users through the call API.
// "booking": generated for/linked to a Booking (a scheduled doctor session).
export const callSources = ["adhoc", "booking"] as const;

export type CallSource = (typeof callSources)[number];

// ringing   -> room created, invited participants have not all joined yet
// active    -> at least one participant has joined
// ended     -> call finished normally (host ended it or everyone left)
// cancelled -> nobody answered before it was cancelled/timed out, or the
//              initiator cancelled before anyone joined
export const callStatuses = [
  "ringing",
  "active",
  "ended",
  "cancelled",
] as const;

export type CallStatus = (typeof callStatuses)[number];

export interface ICallRoom extends MongoDoc {
  initiator?: IUser;
  host?: IUser;
  participants: IUser[];
  callType: CallType;
  source: CallSource;
  booking?: IBooking;
  status: CallStatus;
  startedAt: Date;
  connectedAt?: Date;
  endedAt?: Date;
  endedBy?: IUser;
  recordingEnabled: boolean;
  maxParticipants: number;
  // Virtuals
  callParticipants?: ICallParticipant[];
  //   recordings?: ICallRecording[];
}

const NewCallPage = () => {
  

  const push = useProgress();

  return (
    <CreateForm<
      { participantIds: string[]; callType: string },
      { data: ICallRoom }
    >
      renderer={{
        callType: {
          type: "select",
          options: { video: "video", audio: "audio" },
          title: "type",
        },
        participantIds: {
          title: "partys",
          type: "nodes",
          getOptionLabel: (node) => (node as IUser).phone,
          getOptionValue: (node) => (node as IUser)._id,
          path: `${API}/auto/user`,
          multi: true,
        },
      }}
      hookProps={{
        path: `${API}/call`,
        method: "POST",
        successCb: (result) => {
          console.log(result);
          push(`/dashboard/newCall/${result.data._id}`);
        },
      }}
    />
  );
};

export default NewCallPage;
