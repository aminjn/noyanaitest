"use client";

import { useEffect, useRef, useState } from "react";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import useNotification from "@/Components/Hooks/useNotification";
import SparkIcon from "@/Components/Icons/SparkIcon";
import MicrophoneIcon from "@/Components/Icons/MicrophoneIcon";
import DateInput from "@/Components/UI/DateInput";
import classes from "../../Accounting.module.css";
import { isoDay, useBizFormat } from "../../bizShared";
import { methodKey, parseAmount, statusKey, useFin, useFinText } from "../finShared";
import ai from "./FinAi.module.css";
import { AiOff, errorText, FinAiWarning, isAiOff, useFinAiPost, useFinAiStatus, Warnings } from "./finAi";

type Draft = {
  kind: "expense" | "payment" | "cheque" | "voucher" | "unknown";
  endpoint?: string;
  payload?: Record<string, unknown>;
  summary: Record<string, unknown>;
  question?: string;
  warnings: FinAiWarning[];
  text: string;
};

// the suite endpoints a confirmed draft may go to (under /<panel>/biz)
const ALLOWED = [/^finance\/expenses$/, /^finance\/payments$/, /^finance\/cheques\/[a-f0-9]{24}\/status$/, /^vouchers$/];

const EXAMPLES = ["faiEx1", "faiEx2", "faiEx3", "faiEx4"];
const KIND_KEY: Record<string, string> = {
  expense: "faiKind_expense",
  payment: "faiKind_payment",
  cheque: "faiKind_cheque",
  voucher: "faiKind_voucher",
};
const day = (s: unknown) => {
  const d = typeof s === "string" && s ? new Date(`${s}T12:00:00`) : new Date();
  return Number.isNaN(d.getTime()) ? new Date() : d;
};

// «ثبت با جمله» (Nexxa's auto-journal bar, widened): one sentence or a voice
// note -> the right document (an expense, a receipt or payment against the
// matching invoice, claim or expense, a cheque's new status, or a voucher)
// shown as a card; nothing is posted until the user confirms it.
const SentenceEntry = ({ onPosted }: { onPosted?: () => unknown }) => {
  const t = useFinText();
  const f = useBizFormat();
  const { node, canWrite } = useFin();
  const post = useFinAiPost();
  const { data: status } = useFinAiStatus();
  const pushNotification = useNotification();
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [off, setOff] = useState(false);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState<Date>(new Date());
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [recording, setRecording] = useState(false);
  const rec = useRef<MediaRecorder | null>(null);

  useEffect(() => () => rec.current?.stream.getTracks().forEach((tr) => tr.stop()), []);

  const ask = async (sentence = text) => {
    const s = sentence.trim();
    if (s.length < 3 || busy) return;
    setBusy(true);
    setDraft(null);
    try {
      const d = await post<Draft>("entry", { text: s });
      setDraft(d);
      const p = (d?.payload || {}) as Record<string, unknown>;
      setAmount(p.amount !== undefined ? String(p.amount) : "");
      setDate(day(p.date));
      setDescription(typeof p.description === "string" ? p.description : "");
    } catch (err) {
      if (isAiOff(err)) setOff(true);
      else pushNotification(errorText(err), "Error");
    } finally {
      setBusy(false);
    }
  };

  const voice = async () => {
    if (recording) {
      rec.current?.stop();
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const chunks: Blob[] = [];
      const r = new MediaRecorder(stream);
      r.ondataavailable = (e) => e.data.size && chunks.push(e.data);
      r.onstop = async () => {
        stream.getTracks().forEach((tr) => tr.stop());
        setRecording(false);
        const blob = new Blob(chunks, { type: r.mimeType || "audio/webm" });
        try {
          setBusy(true);
          const d = await post<{ text: string }>("transcribe", { audio: new File([blob], "note.webm", { type: blob.type }) }, true);
          const said = String(d?.text || "").trim();
          setText(said);
          setBusy(false);
          if (said) await ask(said);
        } catch (err) {
          setBusy(false);
          pushNotification(errorText(err), "Error");
        }
      };
      rec.current = r;
      r.start();
      setRecording(true);
    } catch (err) {
      pushNotification(errorText(err), "Error");
    }
  };

  const confirm = async () => {
    if (!draft?.endpoint || !draft.payload || saving) return;
    if (!ALLOWED.some((rx) => rx.test(draft.endpoint!))) return;
    const payload: Record<string, unknown> = { ...draft.payload, date: isoDay(date) };
    if (payload.amount !== undefined) payload.amount = parseAmount(amount);
    if (payload.description !== undefined) payload.description = description.trim() || undefined;
    if (draft.kind === "cheque") payload.note = description.trim() || undefined;
    setSaving(true);
    try {
      await fetcher({ url: `${API}/${node}/biz/${draft.endpoint}`, method: "POST", payload });
      pushNotification(t("bizSaved"), "Success");
      // the account chosen, remembered for a sentence like this one
      const account = (draft.payload.account as string) || "";
      if (account) post("learn", { text: draft.text, account }).catch(() => undefined);
      setDraft(null);
      setText("");
      onPosted?.();
    } catch (err) {
      pushNotification(errorText(err), "Error");
    } finally {
      setSaving(false);
    }
  };

  if (off || (status && !status.enabled)) return <AiOff status={status} />;
  const s = (draft?.summary || {}) as Record<string, unknown>;
  const str = (v: unknown) => (typeof v === "string" || typeof v === "number" ? String(v) : "");
  const lines = Array.isArray(s.lines) ? (s.lines as { code: string; name: string; debit: number; credit: number; label: string }[]) : [];
  return (
    <section className={classes.card}>
      <span className={classes.cardTitle}>{t("faiEntryTitle")}</span>
      <p className={classes.muted}>{t("faiEntryHint")}</p>
      <form
        className={ai.entryRow}
        onSubmit={(e) => {
          e.preventDefault();
          ask();
        }}
      >
        <input value={text} maxLength={600} onChange={(e) => setText(e.target.value)} placeholder={t("faiEntryPh")} aria-label={t("faiEntryTitle")} />
        {status?.voice && (
          <button type="button" className={`${ai.mic} ${recording ? ai.micOn : ""}`} onClick={voice} aria-pressed={recording} title={t(recording ? "faiStopVoice" : "faiVoice")} aria-label={t(recording ? "faiStopVoice" : "faiVoice")}>
            <MicrophoneIcon />
          </button>
        )}
        <button type="submit" className={`${ai.aiButton} ${ai.aiSolid}`} disabled={busy || text.trim().length < 3} aria-busy={busy}>
          <SparkIcon />
          {busy ? t("faiThinking") : t("faiMakeDraft")}
        </button>
      </form>
      {!draft && (
        <div className={ai.examples}>
          {EXAMPLES.map((k) => (
            <button key={k} type="button" onClick={() => (setText(t(k)), ask(t(k)))}>
              {t(k)}
            </button>
          ))}
        </div>
      )}

      {!!draft && (
        <div className={ai.draft}>
          <div className={ai.draftHead}>
            <SparkIcon />
            {t(KIND_KEY[draft.kind] || "faiKind_unknown")}
          </div>
          {draft.kind === "unknown" ? (
            <p className={classes.muted}>{draft.question ? (draft.question.startsWith("fai") ? t(draft.question, [str(s.number)]) : draft.question) : t("faiAskRephrase")}</p>
          ) : (
            <>
              <dl className={ai.kv}>
                {draft.kind === "payment" && (
                  <div>
                    <dt>{t("faiDirection")}</dt>
                    <dd>{t(s.direction === "in" ? "finNewReceipt" : "finNewPayment")}</dd>
                  </div>
                )}
                {!!str(s.account) && (
                  <div>
                    <dt>{t(draft.kind === "expense" ? "finExpenseKind" : "bizAccount")}</dt>
                    <dd>{str(s.account)}</dd>
                  </div>
                )}
                {!!str(s.document) && (
                  <div>
                    <dt>{t("faiDocument")}</dt>
                    <dd>{str(s.document)}</dd>
                  </div>
                )}
                {!!str(s.party || s.vendor) && (
                  <div>
                    <dt>{t("finParty")}</dt>
                    <dd>{str(s.party || s.vendor)}</dd>
                  </div>
                )}
                {!!str(s.money) && (
                  <div>
                    <dt>{t(s.direction === "in" ? "bizReceivedIn" : "bizPaidFrom")}</dt>
                    <dd>{str(s.money)}</dd>
                  </div>
                )}
                {!!str(s.method) && (
                  <div>
                    <dt>{t("faiMethod")}</dt>
                    <dd>{t(methodKey(str(s.method)))}</dd>
                  </div>
                )}
                {draft.kind === "expense" && (
                  <div>
                    <dt>{t("finPaidNow")}</dt>
                    <dd>{t(s.payNow ? "faiYes" : "faiNo")}</dd>
                  </div>
                )}
                {draft.kind === "cheque" && (
                  <>
                    <div>
                      <dt>{t("finChqNumber")}</dt>
                      <dd dir="ltr">{str(s.number)}</dd>
                    </div>
                    <div>
                      <dt>{t("faiNewStatus")}</dt>
                      <dd>{t(statusKey(str(s.status)))}</dd>
                    </div>
                    <div>
                      <dt>{t("bizAmount")}</dt>
                      <dd>{f.money(Number(s.amount))}</dd>
                    </div>
                    <div>
                      <dt>{t("finChqDue")}</dt>
                      <dd>{f.date(str(s.dueDate))}</dd>
                    </div>
                  </>
                )}
              </dl>
              {draft.kind === "voucher" && (
                <div className={classes.tableWrap}>
                  <table className={classes.table}>
                    <thead>
                      <tr>
                        <th>{t("bizAccount")}</th>
                        <th className={classes.num}>{t("bizDebit")}</th>
                        <th className={classes.num}>{t("bizCredit")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lines.map((l, i) => (
                        <tr key={i}>
                          <td className={classes.wrap}>
                            <span dir="ltr">{l.code}</span> {l.name}
                          </td>
                          <td className={classes.num}>{l.debit ? f.money(l.debit) : "—"}</td>
                          <td className={classes.num}>{l.credit ? f.money(l.credit) : "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <div className={classes.form}>
                {draft.payload?.amount !== undefined && (
                  <label className={classes.field}>
                    <span>{t("bizAmount")}</span>
                    <input value={amount} dir="ltr" inputMode="numeric" onChange={(e) => setAmount(e.target.value)} />
                  </label>
                )}
                <div className={classes.field}>
                  <DateInput title={t("bizDate")} defaultValue={date} onChange={(d) => setDate(d)} />
                </div>
                <label className={`${classes.field} ${classes.wide}`}>
                  <span>{t("bizDescription")}</span>
                  <input value={description} maxLength={300} onChange={(e) => setDescription(e.target.value)} />
                </label>
              </div>
            </>
          )}
          <Warnings list={draft.warnings} />
          <div className={classes.actions}>
            <button type="button" className={classes.ghost} onClick={() => setDraft(null)}>
              {t("bizCancel")}
            </button>
            {draft.kind !== "unknown" && canWrite && (
              <button type="button" className={classes.primary} disabled={saving || (draft.kind === "voucher" && s.balanced === false)} onClick={confirm}>
                {t("faiConfirmPost")}
              </button>
            )}
          </div>
          <p className={ai.note}>{t("faiReviewNote")}</p>
        </div>
      )}
    </section>
  );
};

export default SentenceEntry;
