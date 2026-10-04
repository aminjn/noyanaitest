"use client";

import { useState } from "react";
import SparkIcon from "@/Components/Icons/SparkIcon";
import { useFinText } from "../finShared";
import ai from "./FinAi.module.css";
import { errorText, isAiOff, useFinAiPost, useFinAiStatus } from "./finAi";

export type JournalDraft = {
  lines: { code: string; account: string; name: string; debit: number; credit: number; label: string }[];
  balanced: boolean;
  totalDebit: number;
  totalCredit: number;
  date: string;
  description: string;
};

// Nexxa's "build the voucher with AI" bar in JournalEntryEditor: the event
// in one sentence -> balanced lines on the panel's own chart, put into the
// voucher form for the user to check and save. `api` is the panel's
// finance API ("/doctor/biz/finance").
const JournalAiBar = ({ api, onDraft }: { api: string; onDraft: (d: JournalDraft) => unknown }) => {
  const t = useFinText();
  const post = useFinAiPost(api);
  const { data: status } = useFinAiStatus(api);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  if (!status?.enabled) return null;
  const run = async () => {
    if (text.trim().length < 3 || busy) return;
    setBusy(true);
    setErr(null);
    try {
      const d = await post<JournalDraft>("journal", { description: text.trim() });
      if (!d?.lines?.length) setErr(t("faiJournalEmpty"));
      else {
        if (!d.balanced) setErr(t("faiWarnUnbalanced"));
        onDraft(d);
      }
    } catch (e) {
      setErr(isAiOff(e) ? t("faiOff") : errorText(e));
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className={ai.insightBox}>
      <div className={ai.insightHead}>
        <SparkIcon />
        {t("faiJournalTitle")}
      </div>
      <div className={ai.entryRow}>
        <input
          value={text}
          maxLength={1000}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), run())}
          placeholder={t("faiJournalPh")}
          aria-label={t("faiJournalTitle")}
        />
        <button type="button" className={`${ai.aiButton} ${ai.aiSolid}`} onClick={run} disabled={busy || text.trim().length < 3} aria-busy={busy}>
          <SparkIcon />
          {busy ? t("faiThinking") : t("faiJournalBuild")}
        </button>
      </div>
      {!!err && <p className={ai.note}>{err}</p>}
      <p className={ai.note}>{t("faiReviewNote")}</p>
    </div>
  );
};

export default JournalAiBar;
