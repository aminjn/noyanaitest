"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// The microphone for every AI spot (2026-10): MediaRecorder in webm/opus
// (ogg on Firefox when webm is missing). The audio stays in memory and is
// sent once to the server's speech-to-text; nothing is stored.
const pickType = () => {
  if (typeof MediaRecorder === "undefined") return "";
  for (const t of ["audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus", "audio/ogg"])
    if (MediaRecorder.isTypeSupported(t)) return t;
  return "";
};

export const voiceSupported = () =>
  typeof window !== "undefined" && typeof MediaRecorder !== "undefined" && !!navigator.mediaDevices?.getUserMedia;

// at most this long, then it stops by itself
const MAX_SECONDS = 5 * 60;

const useVoiceRecorder = () => {
  const recorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const waiter = useRef<((b: Blob | null) => void) | null>(null);
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);

  const stop = useCallback(
    () =>
      new Promise<Blob | null>((resolve) => {
        const rec = recorder.current;
        if (!rec) return resolve(null);
        waiter.current = resolve;
        rec.onstop = () => {
          rec.stream.getTracks().forEach((t) => t.stop());
          const blob = new Blob(chunks.current, { type: rec.mimeType || "audio/webm" });
          waiter.current?.(blob.size ? blob : null);
          waiter.current = null;
        };
        rec.stop();
        recorder.current = null;
        setRecording(false);
      }),
    [],
  );

  useEffect(() => {
    if (!recording) return;
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [recording]);

  useEffect(() => {
    if (recording && seconds >= MAX_SECONDS) stop();
  }, [recording, seconds, stop]);

  // the page goes away while recording: release the microphone
  useEffect(
    () => () => {
      const rec = recorder.current;
      if (rec) {
        rec.onstop = null;
        try {
          rec.stop();
        } catch {
          // already stopped
        }
        rec.stream.getTracks().forEach((t) => t.stop());
      }
    },
    [],
  );

  const start = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const type = pickType();
    const rec = new MediaRecorder(stream, type ? { mimeType: type } : undefined);
    chunks.current = [];
    rec.ondataavailable = (e) => {
      if (e.data.size) chunks.current.push(e.data);
    };
    rec.start(1000);
    recorder.current = rec;
    setSeconds(0);
    setRecording(true);
  }, []);

  return { recording, seconds, start, stop };
};

export const audioFile = (blob: Blob, name = "voice") =>
  new File([blob], `${name}.${blob.type.includes("ogg") ? "ogg" : "webm"}`, { type: blob.type || "audio/webm" });

export default useVoiceRecorder;
