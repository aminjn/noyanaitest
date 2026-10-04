"use client";

import { useEffect, useRef, useState } from "react";
import SparkIcon from "@/Components/Icons/SparkIcon";
import classes from "../../Accounting.module.css";
import { useFin, useFinText } from "../finShared";
import ai from "./FinAi.module.css";
import { AiOff, Cited, errorText, isAiOff, useFinAiPost, useFinAiStatus } from "./finAi";

type Msg = { role: "user" | "assistant"; content: string; sources?: { ref: string; tool: string; link: string }[] };

const SUGGESTIONS = ["faiQ1", "faiQ2", "faiQ3", "faiQ4", "faiQ5"];

// Nexxa's BooksCopilot («از حساب‌هایت بپرس»): a multi-turn chat over the
// panel's own books. The server builds the context from the suite's report
// functions only; every number in an answer links to its report.
const BooksCopilot = () => {
  const t = useFinText();
  const { panel } = useFin();
  const post = useFinAiPost();
  const { data: status } = useFinAiStatus();
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [off, setOff] = useState(false);
  const end = useRef<HTMLDivElement>(null);

  useEffect(() => {
    end.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [msgs, busy]);

  const ask = async (q0: string) => {
    const q = q0.trim();
    if (!q || busy) return;
    setErr(null);
    const history = msgs.slice(-6).map((m) => ({ role: m.role, content: m.content }));
    const next = [...msgs, { role: "user" as const, content: q }];
    setMsgs(next);
    setInput("");
    setBusy(true);
    try {
      const d = await post<{ answer: string; sources: Msg["sources"] }>("copilot", { question: q, history });
      setMsgs([...next, { role: "assistant", content: String(d?.answer || ""), sources: Array.isArray(d?.sources) ? d.sources : [] }]);
    } catch (e) {
      if (isAiOff(e)) setOff(true);
      else setErr(errorText(e));
    } finally {
      setBusy(false);
    }
  };

  if (off || (status && !status.enabled)) return <AiOff status={status} />;
  return (
    <section className={classes.card}>
      <div className={classes.cardHead}>
        <span className={classes.cardTitle}>{t("faiCopilotTitle")}</span>
        {!!status && <span className={classes.muted}>{t(status.inCountry ? "faiInCountry" : "faiCloud")}</span>}
      </div>
      <div className={ai.chat} aria-live="polite">
        {msgs.length === 0 && (
          <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: "0.75rem", paddingBlock: "1rem" }}>
            <p className={classes.muted}>{t("faiCopilotHint")}</p>
            <div className={ai.examples} style={{ justifyContent: "center" }}>
              {SUGGESTIONS.map((k) => (
                <button key={k} type="button" onClick={() => ask(t(k))}>
                  {t(k)}
                </button>
              ))}
            </div>
          </div>
        )}
        {msgs.map((m, i) => (
          <div key={i} className={`${ai.msg} ${m.role === "user" ? ai.msgUser : ai.msgBot}`}>
            {m.role === "assistant" ? <Cited text={m.content} sources={m.sources || []} panel={panel} /> : m.content}
          </div>
        ))}
        {busy && <div className={`${ai.msg} ${ai.msgBot}`}>{t("faiCheckingBooks")}</div>}
        {!!err && <p className={classes.negative}>{err}</p>}
        <div ref={end} />
      </div>
      <form
        className={ai.entryRow}
        onSubmit={(e) => {
          e.preventDefault();
          ask(input);
        }}
      >
        <input value={input} maxLength={600} onChange={(e) => setInput(e.target.value)} placeholder={t("faiAskPh")} aria-label={t("faiCopilotTitle")} />
        <button type="submit" className={`${ai.aiButton} ${ai.aiSolid}`} disabled={busy || !input.trim()}>
          <SparkIcon />
          {t("faiAsk")}
        </button>
      </form>
      <p className={ai.note}>{t("faiCopilotNote")}</p>
    </section>
  );
};

export default BooksCopilot;
