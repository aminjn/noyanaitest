"use client";

import useSocket from "@/Components/Hooks/useSocket";
import { useParams } from "next/navigation";
import { useEffect, useRef } from "react";

const UserManageCallPage = () => {
  const { nodeId } = useParams();
  const socket = useSocket();

  const pcRef = useRef<RTCPeerConnection | null>(null);

  const remoteAudio = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const pc = pcRef.current || new RTCPeerConnection();
    pcRef.current = pc;
    pc.ontrack = (e) => {
      console.log("Track");
      if (remoteAudio.current) remoteAudio.current.srcObject = e.streams[0];
    };

    socket.on("signal", async (data) => {
      console.log("signal In");
      if (!pcRef.current) return;
      const pc = pcRef.current;
      if (data.sdp) {
        if (data.sdp.type === "offer") {
          if (pc.signalingState === "stable") {
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            socket.emit("signal", { room: nodeId, sdp: pc.localDescription });
          } else {
            console.log("cant answer");
          }
        }
      } else if (data.candidate) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
        } catch (err) {
          console.log("Error on Candidate", err);
        }
      }
    });

    pc.onicecandidate = (e) => {
      if (e.candidate) {
        socket.emit("signal", { room: nodeId, candiate: e.candidate });
      }
    };

    const initStream = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      console.log("signal Out");
      socket.emit("signal", { room: nodeId, sdp: pc.localDescription });
    };
    initStream();

    // return () => {
    //   pc.close();
    // };
  }, [nodeId, socket]);

  return (
    <div>
      <audio ref={remoteAudio} />
    </div>
  );
};

export default UserManageCallPage;
