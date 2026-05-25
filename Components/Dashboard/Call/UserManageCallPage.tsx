"use client";
import { useParams } from "next/navigation";
import useSWR from "swr";
import { CallType, ICallRoom } from "./DashboardManageCallsPage";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import useUser from "@/Components/Hooks/useUser";
import { useCallback, useEffect, useRef, useState } from "react";
import useSocket from "@/Components/Hooks/useSocket";
import useLocale from "@/Components/Hooks/useLocale";
import useNotification from "@/Components/Hooks/useNotification";
import classes from "./UserManageCallPage.module.css";
import { Socket } from "socket.io-client";
import Button from "@/Components/UI/Button";
import useProgress from "@/Components/Hooks/useProgress";

const PrepareCall = ({ room }: { room: ICallRoom<{ participants: true }> }) => {
  const [didGetPermission, setDidGetPermission] = useState(false);

  const [supports, setSupports] = useState<boolean>(false);

  const getContent = useLocale();

  const pushNotification = useNotification();

  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      const hasAudio = devices.some((device) => device.kind === "audioinput");
      const hasVideo = devices.some((device) => device.kind === "videoinput");
      setSupports(hasAudio && (room.callType !== "video" || hasVideo));
    });

    navigator.mediaDevices
      .getUserMedia({ audio: true, video: room.callType === "video" })
      .then((stream) => {
        stream.getTracks().forEach((track) => track.stop());
        setDidGetPermission(true);
      })
      .catch((err) => {
        console.error(err);
        pushNotification(getContent("accessMediaErrorMessage"), "Error");
      });
  }, [getContent, pushNotification, room.callType]);

  if (!supports)
    return <p>{getContent("yourDevicenotSupportingRequiredMedia")}</p>;
  if (!didGetPermission)
    return <p>{getContent("pleaseProvideAccessToMedia")}</p>;
  return <CallManager room={room} />;
};

const CallManager = ({ room }: { room: ICallRoom<{ participants: true }> }) => {
  const socket = useSocket();

  const peerConnection = useRef<RTCPeerConnection | null>(null);

  const remoteAudio = useRef<HTMLAudioElement>(null);

  const localVideo = useRef<HTMLVideoElement>(null);
  const remoteVideo = useRef<HTMLVideoElement>(null);

  const mediaStream = useRef<MediaStream | null>(null);

  const push = useProgress();

  const getContent = useLocale();

  const pushNotification = useNotification();

  const newPc = useCallback(() => {
    //making new Pc
    const oldPc = peerConnection.current;
    if (oldPc) {
      oldPc.close();
    }
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });
    peerConnection.current = pc;
    const stream = mediaStream.current;
    if (stream) {
      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });
    }
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
      if (room.callType === "video") {
        if (remoteVideo.current) remoteVideo.current.srcObject = e.streams[0];
      } else {
        if (remoteAudio.current) remoteAudio.current.srcObject = e.streams[0];
      }
    };
    return pc;
  }, [room._id, room.callType, socket]);

  useEffect(() => {
    const pc = newPc();
    return () => {
      pc.close();
    };
  }, [newPc]);

  //Stream Initiation
  useEffect(() => {
    let stream: MediaStream | undefined;
    navigator.mediaDevices
      .getUserMedia({ audio: true, video: room.callType === "video" })
      .then((s) => {
        stream = s;
        stream.getTracks().forEach((track) => {
          console.log("sending audio track");
          if (room.callType === "video" && localVideo.current)
            localVideo.current.srcObject = s;
          const pc = peerConnection.current;
          if (pc) pc.addTrack(track, s);
        });
        console.log("attempting To Join");
        socket.emit("peerJoin", room._id);
        mediaStream.current = stream;
      })
      .catch((err) => {
        console.log("----------");
        console.log("failed to recieve audio");
        console.error(err);
        console.log("---------");
      });
    return () => {
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, [room._id, room.callType, socket]);

  // Events
  useEffect(() => {
    socket.on("getCandidate", (candidate) => {
      const pc = peerConnection.current;
      if (pc)
        pc.addIceCandidate(new RTCIceCandidate(candidate)).then(() =>
          console.log("Got ICE Candidate"),
        );
    });

    socket.on("peerJoin", () => {
      console.log("someone wants to join");
      const pc = peerConnection.current;
      if (pc) {
        pc.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: room.callType === "video",
          iceRestart: true,
        })
          .then((sdp) => {
            pc.setLocalDescription(sdp).catch((err) => {
              pushNotification(getContent("connectionError"), "Error");
              console.error(err);
            });
            socket.emit("offer", { sdp, room: room._id });
            console.log("Offer Sent");
          })
          .catch((err) => {
            console.log("------");
            console.log("error sending offer");
            console.error(err);
            console.log("--------");
          });
      }
      console.log("Someone Joined");
    });

    socket.on("getOffer", (sdp) => {
      console.log("Offer recieved");
      const pc = peerConnection.current;
      if (pc) {
        pc.setRemoteDescription(sdp)
          .then(() => {
            console.log("Set Remote Description");
            pc.createAnswer()
              .then((sdp1) => {
                console.log("answer created");
                pc.setLocalDescription(sdp1).catch((err) => {
                  pushNotification(getContent("connectionError"), "Error");
                  console.error(err);
                });
                socket.emit("answer", { sdp: sdp1, room: room._id });
                console.log("answer Sent");
              })
              .catch((err) => {
                console.log("-------");
                console.log("error Sending answer");
                console.error(err);
                console.log("--------");
              });
          })
          .catch((err) => {
            pushNotification(getContent("connectionError"), "Error");
            console.error(err);
          });
      }
    });

    socket.on("getAnswer", (sdp) => {
      console.log("got Answer");
      const pc = peerConnection.current;
      if (pc) {
        pc.setRemoteDescription(sdp).catch((err) => {
          pushNotification(getContent("connectionError"), "Error");
          console.error(err);
        });
      }
    });

    socket.on("peerLeft", () => {
      console.log("peer Left");
      newPc();
    });

    return () => {
      socket.off("getCandidate");
      socket.off("peerJoin");
      socket.off("getOffer");
      socket.off("getAnswer");
      socket.off("peerLeft");
    };
  }, [getContent, newPc, pushNotification, room._id, room.callType, socket]);

  useEffect(() => {
    return () => {
      socket.emit("leaveCall", room._id);
    };
  }, [room._id, socket]);

  if (room.callType === "video")
    return (
      <div className={classes.videoCall}>
        <div className={classes.localVideo}>
          <video
            ref={localVideo}
            className={classes.video}
            playsInline
            autoPlay
            muted
          />
        </div>
        <div className={classes.remoteVideo}>
          <video
            ref={remoteVideo}
            className={classes.video}
            playsInline
            autoPlay
          />
        </div>
        <Button variant="Error" onClick={() => push("/dashboard/call")}>
          Hang up
        </Button>
      </div>
    );

  return (
    <div className={classes.audioCall}>
      {/* <audio muted autoPlay ref={localAudio} /> */}
      <div className={classes.localAudio}></div>
      <div className={classes.remoteAudio}></div>
      <audio autoPlay ref={remoteAudio} className={classes.audio} />
      <Button variant="Error" onClick={() => push("/dashboard/call")}>
        Hang up
      </Button>
    </div>
  );
};

const NewUserManageCallPage = () => {
  const { nodeId } = useParams<{ nodeId: string }>();
  const { data, error } = useSWR<ICallRoom<{ participants: true }>>(
    `${API}/call/${nodeId}`,
    (url: string) => fetcher({ url }).then((res) => res.data),
  );

  const { user } = useUser();

  return (
    <HandleLoading data={!!data && !!user} error={error}>
      {!!data && !!user && <PrepareCall room={data} />}
    </HandleLoading>
  );
};

export default NewUserManageCallPage;
