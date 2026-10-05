"use client";

import { useState } from "react";
import { fetcher } from "@/Components/helpers/fetcher";
import useNotification from "@/Components/Hooks/useNotification";
import Ixon from "@/Components/UI/Ixon";
import SparkIcon from "@/Components/Icons/SparkIcon";
import XMarkIcon from "@/Components/Icons/XMarkIcon";
import { aiBase, T, useAiStatus, useAiText } from "@/Components/Ai/aiShared";
import AiLocked, { aiGateOf, AiGateInfo, gateOfState } from "@/Components/Ai/AiLocked";
import ai from "@/Components/Ai/Ai.module.css";
import classes from "./ChatAiSuggest.module.css";

// AI reply suggestions in the doctor's patient chat (2026-10): a one-line
// summary of the thread and up to three replies to pick from. A picked
// reply only fills the message box - the doctor (or the secretary answering
// for the doctor) edits and sends it. Hidden when the server or the access
// does not allow it or the AI policy switched it off; locked (with the
// upgrade link) when the plan does not include it or its quota is used up.
const ChatAiSuggest = ({ chatId, onPick }: { chatId: string; onPick: (text: string) => void }) => {
  const { status, mutate } = useAiStatus("doctor");
  const t = useAiText("doctor");
  const notify = useNotification();
  const [busy, setBusy] = useState(false);
  const [data, setData] = useState<{ summary: string; suggestions: string[] } | null>(null);
  const [refused, setRefused] = useState<AiGateInfo | null>(null);
  const feature = status?.features?.["clinical.chatSuggest"];
  if (!status?.configured || !status?.acl?.chat || !feature || feature.state === "off") return null;
  const gate = refused || gateOfState(feature);
  if (gate)
    return (
      <div className={classes.bar}>
        <AiLocked profile="doctor" gate={gate} compact />
      </div>
    );

  const load = async () => {
    setBusy(true);
    try {
      const res = await fetcher({ url: `${aiBase("doctor")}/chat/${chatId}/suggest`, method: "POST" });
      setData(res.data);
      mutate();
    } catch (err) {
      const g = aiGateOf(err);
      if (g) setRefused(g);
      else notify((err as Error).message, "Error");
    } finally {
      setBusy(false);
    }
  };

  if (!data)
    return (
      <div className={classes.bar}>
        <button type="button" className={ai.aiButton} onClick={load} disabled={busy}>
          <Ixon width="0.9rem">
            <SparkIcon />
          </Ixon>
          {busy ? t(T("aiThinking", "در حال آماده‌سازی…")) : t(T("chatAiSuggest", "پیشنهاد پاسخ با هوش مصنوعی"))}
        </button>
      </div>
    );
  return (
    <div className={classes.panel}>
      <div className={classes.head}>
        {!!data.summary && <p className={ai.muted}>{data.summary}</p>}
        <button type="button" className={classes.close} onClick={() => setData(null)} aria-label={t(T("copClose", "بستن"))}>
          <Ixon width="0.9rem">
            <XMarkIcon />
          </Ixon>
        </button>
      </div>
      {data.suggestions.length ? (
        <div className={ai.chips}>
          {data.suggestions.map((s) => (
            <button key={s} type="button" className={ai.chip} dir="auto" onClick={() => onPick(s)}>
              {s}
            </button>
          ))}
        </div>
      ) : (
        <p className={ai.muted}>{t(T("chatAiNoSuggestion", "پیشنهادی نیست؛ پیام تازه‌ای از بیمار نیامده است."))}</p>
      )}
      <p className={ai.muted}>{t(T("chatAiHint", "پیشنهاد فقط در کادر پیام می‌نشیند؛ پیش از فرستادن بخوانید و ویرایش کنید."))}</p>
    </div>
  );
};

export default ChatAiSuggest;
