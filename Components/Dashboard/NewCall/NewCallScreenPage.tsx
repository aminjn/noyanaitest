"use client";

import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import {
  CallApi,
  CallClient,
  CallParticipantRole,
  ICallRoom,
  MediaTag,
} from "@/Components/Call/CallClient";
import useNotification from "@/Components/Hooks/useNotification";
import useProgress from "@/Components/Hooks/useProgress";
import useSocket from "@/Components/Hooks/useSocket";
import useUser from "@/Components/Hooks/useUser";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import classes from "./NewCallScreenPage.module.css";

// ---------------------------------------------------------------------------
// Small inline icons - there is no mic/camera/screen-share/hangup icon in
// Components/Icons yet, so these are kept local to this file for now.
// ---------------------------------------------------------------------------

type IconProps = { size?: string; className?: string };

const MicIcon = ({ size = "1.4rem", className }: IconProps) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="9" y="2" width="6" height="12" rx="3" />
    <path d="M5 11a7 7 0 0 0 14 0" />
    <path d="M12 18v4" />
    <path d="M8 22h8" />
  </svg>
);

const MicOffIcon = ({ size = "1.4rem", className }: IconProps) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="9" y="2" width="6" height="12" rx="3" />
    <path d="M5 11a7 7 0 0 0 14 0" />
    <path d="M12 18v4" />
    <path d="M8 22h8" />
    <path d="M3 3l18 18" />
  </svg>
);

const CameraIcon = ({ size = "1.4rem", className }: IconProps) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="2" y="6" width="14" height="12" rx="2" />
    <path d="M16 10l6-3.5v11L16 14" />
  </svg>
);

const CameraOffIcon = ({ size = "1.4rem", className }: IconProps) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="2" y="6" width="14" height="12" rx="2" />
    <path d="M16 10l6-3.5v11L16 14" />
    <path d="M2 2l20 20" />
  </svg>
);

const ScreenShareIcon = ({ size = "1.4rem", className }: IconProps) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="2" y="4" width="20" height="13" rx="2" />
    <path d="M8 21h8" />
    <path d="M12 17v4" />
    <path d="M9.5 10.5L12 8l2.5 2.5" />
    <path d="M12 8v5" />
  </svg>
);

const HangupIcon = ({ size = "1.4rem", className }: IconProps) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M12 9c-3.6 0-6.9 1.2-9.6 3.2a1.5 1.5 0 0 0-.3 2.1l1.9 2.5c.5.6 1.3.8 2 .4l2.3-1.1c.5-.2.8-.7.8-1.2v-2c1-.3 2-.4 2.9-.4s1.9.1 2.9.4v2c0 .5.3 1 .8 1.2l2.3 1.1c.7.3 1.5.1 2-.4l1.9-2.5a1.5 1.5 0 0 0-.3-2.1C18.9 10.2 15.6 9 12 9z" />
  </svg>
);

const CloseIcon = ({ size = "1rem", className }: IconProps) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2.2}
    strokeLinecap="round"
  >
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);

// ---------------------------------------------------------------------------
// Track rendering helpers - each takes a raw MediaStreamTrack (as handed out
// by CallClient's "localTrack"/"remoteTrack" events) and wraps it in a
// throwaway MediaStream just for the <video>/<audio> element.
// ---------------------------------------------------------------------------

const VideoTrackView = ({
  track,
  muted,
  className,
}: {
  track: MediaStreamTrack;
  muted?: boolean;
  className?: string;
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    el.srcObject = new MediaStream([track]);
    return () => {
      el.srcObject = null;
    };
  }, [track]);

  return (
    <video
      ref={videoRef}
      className={className}
      autoPlay
      playsInline
      muted={muted}
    />
  );
};

const AudioTrackView = ({ track }: { track: MediaStreamTrack }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    el.srcObject = new MediaStream([track]);
    return () => {
      el.srcObject = null;
    };
  }, [track]);

  return <audio ref={audioRef} autoPlay />;
};

const ParticipantTile = ({
  label,
  isHost,
  videoTrack,
  audioTrack,
  audioMuted,
  videoMuted,
  canKick,
  onKick,
  localPreview,
}: {
  label: string;
  isHost?: boolean;
  videoTrack?: MediaStreamTrack;
  audioTrack?: MediaStreamTrack;
  audioMuted?: boolean;
  videoMuted?: boolean;
  canKick?: boolean;
  onKick?: () => void;
  localPreview?: boolean;
}) => (
  <div className={classes.tile}>
    {videoTrack && !videoMuted ? (
      <VideoTrackView
        track={videoTrack}
        muted={localPreview}
        className={classes.video}
      />
    ) : (
      <div className={classes.avatarPlaceholder}>
        <div className={classes.avatarCircle}>{label.slice(0, 2)}</div>
      </div>
    )}
    {!localPreview && audioTrack && <AudioTrackView track={audioTrack} />}
    <span className={classes.tileLabel}>
      {isHost && <span className={classes.tileBadge}>میزبان ·</span>}
      <span>{label}</span>
      {audioMuted && <MicOffIcon size="0.9rem" className={classes.mutedIcon} />}
    </span>
    {canKick && (
      <button
        type="button"
        className={classes.kickButton}
        onClick={onKick}
        title="حذف از تماس"
      >
        <CloseIcon />
      </button>
    )}
  </div>
);

// ---------------------------------------------------------------------------

type RemoteTrackEntry = {
  userId: string;
  mediaTag: MediaTag;
  producerId: string;
  track: MediaStreamTrack;
};

type MuteState = { audio?: boolean; video?: boolean };

const Inner = ({ callId, userId }: { callId: string; userId: string }) => {
  const socket = useSocket();
  const push = useProgress();
  const pushNotification = useNotification();

  const call = useMemo(() => new CallClient(socket, userId), [socket, userId]);

  const [room, setRoom] = useState<ICallRoom | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [joining, setJoining] = useState(true);

  const [role, setRole] = useState<CallParticipantRole | null>(null);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(false);
  const [sharingScreen, setSharingScreen] = useState(false);
  const [recording, setRecording] = useState(false);

  const [connectedUsers, setConnectedUsers] = useState<Set<string>>(new Set());
  const [muteStates, setMuteStates] = useState<Record<string, MuteState>>({});
  const [remoteTracks, setRemoteTracks] = useState<
    Record<string, RemoteTrackEntry>
  >({});
  const [localVideoTrack, setLocalVideoTrack] =
    useState<MediaStreamTrack | null>(null);

  // -- load the room first so we know its callType (voice/video) before we
  //    ever call join() - joining a video call as audio-only would mean
  //    nobody gets our camera. --------------------------------------------
  useEffect(() => {
    let cancelled = false;
    CallApi.getOne(callId)
      .then(({ room, connectedUserIds }) => {
        if (cancelled) return;
        setRoom(room);
        setCamOn(room.callType === "video");
        setConnectedUsers(new Set(connectedUserIds));
      })
      .catch((err: Error) => {
        if (cancelled) return;
        setLoadError(err.message || "بارگذاری اطلاعات تماس با خطا مواجه شد");
        setJoining(false);
      });
    return () => {
      cancelled = true;
    };
  }, [callId]);

  // -- wire up every CallClient event exactly once per client instance ----
  useEffect(() => {
    const offJoined = call.on("joined", ({ role }) => {
      setRole(role);
      setConnectedUsers((prev) => new Set(prev).add(userId));
    });

    const offLocalTrack = call.on("localTrack", ({ mediaTag, track }) => {
      if (mediaTag === "webcam") setLocalVideoTrack(track);
    });

    const offRemoteTrack = call.on("remoteTrack", (payload) => {
      setRemoteTracks((prev) => ({ ...prev, [payload.producerId]: payload }));
      setConnectedUsers((prev) => new Set(prev).add(payload.userId));
    });

    const offRemoteTrackClosed = call.on(
      "remoteTrackClosed",
      ({ producerId }) => {
        setRemoteTracks((prev) => {
          if (!(producerId in prev)) return prev;
          const next = { ...prev };
          delete next[producerId];
          return next;
        });
      },
    );

    const offParticipantJoined = call.on(
      "participantJoined",
      ({ userId: id }) => {
        setConnectedUsers((prev) => new Set(prev).add(id));
      },
    );

    const offParticipantLeft = call.on(
      "participantLeft",
      ({ userId: id, reason }) => {
        setConnectedUsers((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
        setRemoteTracks((prev) => {
          const next = { ...prev };
          let changed = false;
          for (const key in next) {
            if (next[key].userId === id) {
              delete next[key];
              changed = true;
            }
          }
          return changed ? next : prev;
        });
        if (reason === "kicked") {
          pushNotification("یکی از شرکت‌کنندگان از تماس حذف شد", "Notify");
        }
      },
    );

    const offParticipantRejected = call.on("participantRejected", () => {
      pushNotification("یکی از شرکت‌کنندگان تماس را رد کرد", "Notify");
    });

    const offMuteChanged = call.on(
      "muteChanged",
      ({ userId: id, kind, muted }) => {
        setMuteStates((prev) => ({
          ...prev,
          [id]: { ...prev[id], [kind]: muted },
        }));
      },
    );

    const offYouWereMuted = call.on("youWereMuted", ({ kind, muted }) => {
      if (kind === "audio") setMicOn(!muted);
      else setCamOn(!muted);
      pushNotification(
        muted
          ? "میزبان دسترسی شما را قطع کرد"
          : "میزبان دسترسی شما را بازگرداند",
        "Warn",
      );
    });

    const offKicked = call.on("kicked", () => {
      pushNotification("میزبان شما را از تماس حذف کرد", "Error");
      push("/dashboard");
    });

    const offCancelled = call.on("cancelled", () => {
      pushNotification("تماس بدون پاسخ لغو شد", "Notify");
      push("/dashboard");
    });

    const offEnded = call.on("ended", () => {
      pushNotification("تماس به پایان رسید", "Notify");
      push("/dashboard");
    });

    const offRecordingStarted = call.on("recordingStarted", () => {
      setRecording(true);
      pushNotification("ضبط تماس آغاز شد", "Notify");
    });

    const offRecordingStopped = call.on("recordingStopped", () => {
      setRecording(false);
      pushNotification("ضبط تماس متوقف شد", "Notify");
    });

    const offError = call.on("error", ({ message }) => {
      pushNotification(message, "Error");
    });

    return () => {
      offJoined();
      offLocalTrack();
      offRemoteTrack();
      offRemoteTrackClosed();
      offParticipantJoined();
      offParticipantLeft();
      offParticipantRejected();
      offMuteChanged();
      offYouWereMuted();
      offKicked();
      offCancelled();
      offEnded();
      offRecordingStarted();
      offRecordingStopped();
      offError();
      call.destroy();
    };
    // call is stable for the lifetime of this component (only changes if
    // socket/userId change, which recreates it) - only re-run then.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [call]);

  // -- actually join, once we know the call's type -------------------------
  useEffect(() => {
    if (!room) return;
    let cancelled = false;
    call
      .join(callId, { video: room.callType === "video" })
      .catch((err: Error) => {
        if (cancelled) return;
        pushNotification(
          err.message || "اتصال به تماس با خطا مواجه شد",
          "Error",
        );
        push("/dashboard");
      })
      .finally(() => {
        if (!cancelled) setJoining(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [call, room, callId]);

  const toggleMic = useCallback(() => {
    const next = !micOn;
    setMicOn(next);
    call
      .setMute("audio", !next)
      .catch((err: Error) => pushNotification(err.message, "Error"));
  }, [call, micOn, pushNotification]);

  const toggleCam = useCallback(() => {
    const next = !camOn;
    setCamOn(next);
    call
      .setMute("video", !next)
      .catch((err: Error) => pushNotification(err.message, "Error"));
  }, [call, camOn, pushNotification]);

  const toggleScreenShare = useCallback(async () => {
    try {
      if (sharingScreen) {
        await call.stopScreenShare();
        setSharingScreen(false);
      } else {
        await call.startScreenShare();
        setSharingScreen(true);
      }
    } catch (err) {
      const name = (err as { name?: string }).name;
      if (name !== "NotAllowedError" && name !== "AbortError") {
        pushNotification((err as Error).message, "Error");
      }
    }
  }, [call, sharingScreen, pushNotification]);

  const handleLeave = useCallback(() => {
    call.leave().finally(() => push("/dashboard"));
  }, [call, push]);

  const handleEndForAll = useCallback(() => {
    if (!room) return;
    CallApi.end(room._id)
      .then(() => push("/dashboard"))
      .catch((err: Error) => pushNotification(err.message, "Error"));
  }, [room, push, pushNotification]);

  const handleToggleRecording = useCallback(() => {
    const action = recording ? call.stopRecording() : call.startRecording();
    action.catch((err: Error) => pushNotification(err.message, "Error"));
  }, [call, recording, pushNotification]);

  const handleKick = useCallback(
    (targetUserId: string) => {
      call
        .kickParticipant(targetUserId)
        .catch((err: Error) => pushNotification(err.message, "Error"));
    },
    [call, pushNotification],
  );

  const remoteTrackList = useMemo(
    () => Object.values(remoteTracks),
    [remoteTracks],
  );

  const remoteUserIds = useMemo(() => {
    const ids: string[] = [];
    connectedUsers.forEach((id) => {
      if (id !== userId) ids.push(id);
    });
    return ids;
  }, [connectedUsers, userId]);

  const screenShareEntry = remoteTrackList.find(
    (t) => t.mediaTag === "screenVideo",
  );

  if (loadError) {
    return (
      <div className={classes.main}>
        <div className={classes.centerState}>{loadError}</div>
      </div>
    );
  }

  if (!room || joining) {
    return (
      <div className={classes.main}>
        <div className={classes.centerState}>در حال اتصال به تماس...</div>
      </div>
    );
  }

  const isHost = role === "host";

  return (
    <div className={classes.main}>
      {recording && (
        <div className={classes.recordingBadge}>
          <span className={classes.recordingDot} />
          در حال ضبط
        </div>
      )}

      {screenShareEntry ? (
        <div className={classes.screenShare}>
          <VideoTrackView
            track={screenShareEntry.track}
            className={classes.screenShareVideo}
          />
        </div>
      ) : (
        <div className={classes.grid}>
          <ParticipantTile
            label="شما"
            localPreview
            videoTrack={camOn ? (localVideoTrack ?? undefined) : undefined}
            audioMuted={!micOn}
            videoMuted={!camOn}
          />
          {remoteUserIds.map((id) => (
            <ParticipantTile
              key={id}
              label={room.host === id ? "میزبان" : `کاربر ${id.slice(-4)}`}
              isHost={room.host === id}
              videoTrack={
                remoteTrackList.find(
                  (t) => t.userId === id && t.mediaTag === "webcam",
                )?.track
              }
              audioTrack={
                remoteTrackList.find(
                  (t) => t.userId === id && t.mediaTag === "mic",
                )?.track
              }
              audioMuted={muteStates[id]?.audio}
              videoMuted={muteStates[id]?.video}
              canKick={isHost}
              onKick={() => handleKick(id)}
            />
          ))}
        </div>
      )}

      <div className={classes.controls}>
        <button
          type="button"
          className={`${classes.controlButton} ${!micOn ? classes.controlButtonOff : ""}`}
          onClick={toggleMic}
          title={micOn ? "قطع میکروفون" : "روشن کردن میکروفون"}
        >
          {micOn ? <MicIcon /> : <MicOffIcon />}
        </button>

        {room.callType === "video" && (
          <button
            type="button"
            className={`${classes.controlButton} ${!camOn ? classes.controlButtonOff : ""}`}
            onClick={toggleCam}
            title={camOn ? "خاموش کردن دوربین" : "روشن کردن دوربین"}
          >
            {camOn ? <CameraIcon /> : <CameraOffIcon />}
          </button>
        )}

        <button
          type="button"
          className={`${classes.controlButton} ${sharingScreen ? classes.controlButtonActive : ""}`}
          onClick={toggleScreenShare}
          title={sharingScreen ? "توقف اشتراک‌گذاری صفحه" : "اشتراک‌گذاری صفحه"}
        >
          <ScreenShareIcon />
        </button>

        {isHost && (
          <button
            type="button"
            className={`${classes.controlButton} ${recording ? classes.controlButtonActive : ""}`}
            onClick={handleToggleRecording}
            title={recording ? "توقف ضبط تماس" : "شروع ضبط تماس"}
          >
            <span className={classes.recordingDot} />
          </button>
        )}

        <button
          type="button"
          className={`${classes.controlButton} ${classes.hangupButton}`}
          onClick={handleLeave}
          title="خروج از تماس"
        >
          <HangupIcon />
        </button>

        {isHost && (
          <button
            type="button"
            className={`${classes.controlButton} ${classes.hangupButton}`}
            onClick={handleEndForAll}
            title="پایان تماس برای همه"
          >
            <CloseIcon size="1.4rem" />
          </button>
        )}
      </div>
    </div>
  );
};

const NewCallScreenPage = () => {
  const { callId } = useParams<{ callId: string }>();
  const { user, isUserLoading } = useUser(true);

  return (
    <HandleLoading data={!isUserLoading && !!user}>
      {user && <Inner callId={callId} userId={user._id} />}
    </HandleLoading>
  );
};

export default NewCallScreenPage;
