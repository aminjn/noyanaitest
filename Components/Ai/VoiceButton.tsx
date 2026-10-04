"use client";

import { useEffect, useState } from "react";
import { fetcher } from "@/Components/helpers/fetcher";
import useNotification from "@/Components/Hooks/useNotification";
import { useIntlLocale } from "@/Components/i18n/navigation";
import Ixon from "@/Components/UI/Ixon";
import MicrophoneIcon from "@/Components/Icons/MicrophoneIcon";
import LoadingIcon from "@/Components/Icons/LoadingIcon";
import useVoiceRecorder, { audioFile, voiceSupported } from "./useVoiceRecorder";
import { aiBase, AiProfile, T, useAiText } from "./aiShared";
import classes from "./Ai.module.css";

// A mic button: press to record, press again to stop; the audio goes to the
// profile's speech-to-text and the text comes back to `onText`.
const VoiceButton = ({
  profile,
  onText,
  disabled,
  compact,
  className = "",
}: {
  profile: AiProfile;
  onText: (text: string) => unknown;
  disabled?: boolean;
  compact?: boolean;
  className?: string;
}) => {
  const rec = useVoiceRecorder();
  const t = useAiText(profile);
  const notify = useNotification();
  const intl = useIntlLocale();
  const [busy, setBusy] = useState(false);
  // decided after mount, so the server and the first render agree
  const [supported, setSupported] = useState(false);
  useEffect(() => setSupported(voiceSupported()), []);
  if (!supported) return null;

  const toggle = async () => {
    if (busy) return;
    if (!rec.recording) {
      try {
        await rec.start();
      } catch {
        notify(t(T("aiMicDenied", "اجازه‌ی استفاده از میکروفون داده نشد")), "Error");
      }
      return;
    }
    const blob = await rec.stop();
    if (!blob) return;
    setBusy(true);
    try {
      const res = await fetcher({
        url: `${aiBase(profile)}/transcribe`,
        method: "POST",
        bodyParser: "FORM",
        payload: { audio: audioFile(blob) },
      });
      const text = String(res?.data?.text || "").trim();
      if (text) onText(text);
      else notify(t(T("aiHeardNothing", "صدایی شنیده نشد؛ دوباره بگویید")), "Warn");
    } catch (err) {
      notify((err as Error).message, "Error");
    } finally {
      setBusy(false);
    }
  };

  const two = new Intl.NumberFormat(intl, { minimumIntegerDigits: 2 });
  const clock = `${new Intl.NumberFormat(intl).format(Math.floor(rec.seconds / 60))}:${two.format(rec.seconds % 60)}`;
  return (
    <button
      type="button"
      className={`${classes.mic} ${rec.recording ? classes.micOn : ""} ${compact ? classes.micCompact : ""} ${className}`}
      onClick={toggle}
      disabled={disabled || busy}
      aria-pressed={rec.recording}
      aria-label={t(rec.recording ? T("aiStopRecording", "پایان ضبط") : T("aiStartRecording", "گفتن با صدا"))}
      title={t(rec.recording ? T("aiStopRecording", "پایان ضبط") : T("aiStartRecording", "گفتن با صدا"))}
    >
      <Ixon width="1.125rem">{busy ? <LoadingIcon /> : <MicrophoneIcon />}</Ixon>
      {!compact && (
        <span>
          {busy
            ? t(T("aiTranscribing", "در حال تبدیل صدا به متن…"))
            : rec.recording
              ? `${t(T("aiStopRecording", "پایان ضبط"))} · ${clock}`
              : t(T("aiStartRecording", "گفتن با صدا"))}
        </span>
      )}
    </button>
  );
};

export default VoiceButton;
