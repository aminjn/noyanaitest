"use client";
import { useParams } from "next/navigation";
import useSWR from "swr";
import { ICallRoom } from "./DashboardManageCallsPage";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import useUser, { IUser } from "@/Components/Hooks/useUser";
import { useEffect, useRef } from "react";
import useSocket from "@/Components/Hooks/useSocket";

const CallManager = ({ room, user }: { room: ICallRoom; user: IUser }) => {
  const socket = useSocket();

  const peerConnection = useRef<RTCPeerConnection | null>(null);

  const localAudio = useRef<HTMLAudioElement>(null);
  const remoteAudio = useRef<HTMLAudioElement>(null);

  useEffect(() => {}, [room._id, socket]);

  useEffect(() => {
    let pc = peerConnection.current;
    if (!pc) {
      console.log("initiating pc");
      pc = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });
      peerConnection.current = pc;
    }

    console.log("adding pc listeners");

    pc.onicecandidate = (e) => {
      if (e.candidate) {
        console.log("onicecandidate");
        socket.emit("candidate", { candidate: e.candidate, room: room._id });
      }
    };

    pc.oniceconnectionstatechange = (e) => {
      console.log("--------");
      console.log("icecandidateChange");
      console.log(e);
      console.log("---------");
    };

    pc.ontrack = (e) => {
      console.log("recieved audio track");
      if (remoteAudio.current) remoteAudio.current.srcObject = e.streams[0];
    };

    let stream: MediaStream | undefined;

    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((s) => {
        stream = s;
        if (localAudio.current) localAudio.current.srcObject = stream;
        stream.getTracks().forEach((track) => {
          console.log("sending audio track");
          pc.addTrack(track, s);
        });
      })
      .catch((err) => {
        console.log("----------");
        console.log("failed to recieve audio");
        console.log(err);
        console.log("---------");
      });

    socket.on("getCandidate", (candidate) => {
      pc.addIceCandidate(new RTCIceCandidate(candidate)).then(() =>
        console.log("Got ICE Candidate")
      );
    });

    socket.on("peerJoin", () => {
      console.log("someone wants to join");
      pc.createOffer({ offerToReceiveAudio: true })
        .then((sdp) => {
          pc.setLocalDescription(sdp);
          socket.emit("offer", { sdp, room: room._id });
          console.log("Offer Sent");
        })
        .catch((err) => {
          console.log("------");
          console.log("error sending offer");
          console.log(err);
          console.log("--------");
        });
      console.log("Someone Joined");
    });

    socket.on("getOffer", (sdp) => {
      console.log("Offer recieved");
      pc.setRemoteDescription(sdp).then(() => {
        console.log("Set Remote Description");
        pc.createAnswer({ offerToReceiveAudio: true })
          .then((sdp1) => {
            console.log("answer created");
            pc.setLocalDescription(sdp1);
            socket.emit("answer", { sdp: sdp1, room: room._id });
            console.log("answer Sent");
          })
          .catch((err) => {
            console.log("-------");
            console.log("error Sending answer");
            console.log(err);
            console.log("--------");
          });
      });
    });

    socket.on("getAnswer", (sdp) => {
      console.log("got Answer");
      pc.setRemoteDescription(sdp);
    });

    console.log("sending Im here");
    socket.emit("peerJoin", room._id);

    return () => {
      pc.close();
      socket.off("getCandidate");
      socket.off("peerJoin");
      socket.off("getOffer");
      socket.off("getAnswer");
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, [room._id, socket]);

  useEffect(() => {});

  return (
    <div>
      {/* <audio muted autoPlay ref={localAudio} /> */}
      <audio autoPlay ref={remoteAudio} />
    </div>
  );
};

const NewUserManageCallPage = () => {
  const { nodeId } = useParams<{ nodeId: string }>();
  const { data, error } = useSWR<ICallRoom>(
    `${API}/call/${nodeId}`,
    (url: string) => fetcher({ url }).then((res) => res.data)
  );

  const { user } = useUser();

  return (
    <HandleLoading data={!!data && !!user} error={error}>
      {!!data && !!user && <CallManager room={data} user={user} />}
    </HandleLoading>
  );
};

export default NewUserManageCallPage;
