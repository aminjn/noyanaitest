"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import useNotification from "@/Components/Hooks/useNotification";
import useProgress from "@/Components/Hooks/useProgress";
import { useIntlLocale } from "@/Components/i18n/navigation";
import Link from "@/Components/i18n/Link";
import DateInput from "@/Components/UI/DateInput";
import Button from "@/Components/UI/Button";
import { DeskSlot, toYmd } from "@/Components/DoctorPanel/Desk/deskShared";
import useVoiceRecorder, { audioFile } from "../useVoiceRecorder";
import { aiBase, AiProfile, T, Txt, useAiText } from "../aiShared";
import ai from "../Ai.module.css";
import classes from "./Copilot.module.css";

// What a copilot tool returned (backend Lib/ai/copilot/types.ts Card). A
// "confirm" card is a filled form: nothing is sent until the user presses
// confirm, and then it goes to the normal endpoint with the user's login.

export type CardField = {
  key: string;
  label: Txt;
  type: "text" | "textarea" | "number" | "date" | "select" | "slot" | "lines";
  value?: unknown;
  options?: { value: string; label: string | Txt }[];
  required?: boolean;
  slot?: { sessionTypeField?: string; sessionType?: string; exceptField?: string };
};
export type CardRow = { title: string; sub?: string; badge?: Txt; link?: string };
export type CopilotCardData =
  | { type: "navigate"; path: string; title?: Txt }
  | { type: "list"; title: Txt; rows: CardRow[]; text?: string; link?: string; empty?: Txt }
  | { type: "insight"; title: Txt; text: string; link?: string; rows?: CardRow[] }
  | {
      type: "confirm";
      title: Txt;
      text?: string;
      fields: CardField[];
      request: { method: "POST" | "PATCH" | "PUT"; path: string; body?: Record<string, unknown> };
      link?: string;
      done?: Txt;
    }
  | { type: "callAnalyze"; title: Txt }
  | { type: "message"; text: Txt; raw?: string };

type Line = { item: string; label: string; qty: number; unitCost: number };
type SlotValue = { date?: string; start?: number | null; end?: number };

// the panel's own path or the admin's (no language prefix there)
const Go = ({ href, children, admin }: { href: string; children: React.ReactNode; admin: boolean }) =>
  admin ? <a href={href}>{children}</a> : <Link href={href}>{children}</Link>;

const SlotField = ({
  profile,
  value,
  sessionType,
  except,
  onChange,
}: {
  profile: AiProfile;
  value: SlotValue;
  sessionType?: string;
  except?: string;
  onChange: (v: SlotValue) => void;
}) => {
  const t = useAiText(profile);
  const intl = useIntlLocale();
  const two = useMemo(() => new Intl.NumberFormat(intl, { minimumIntegerDigits: 2 }), [intl]);
  const q = new URLSearchParams();
  if (value.date) q.set("date", value.date);
  if (sessionType) q.set("sessionType", sessionType);
  if (except) q.set("except", except);
  const { data, isLoading } = useSWR<{ dayOff: boolean; slots: DeskSlot[] }>(
    value.date ? `${API}/doctor/desk/slots?${q.toString()}` : null,
    (url: string) => fetcher({ url }).then((res) => res.data),
  );
  const free = useMemo(() => (Array.isArray(data?.slots) ? data!.slots : []).filter((s) => !s.taken && !s.past), [data]);
  // the asked-for time: the free session nearest to it, once per day
  const picked = useRef<string>("");
  useEffect(() => {
    if (!free.length || !value.date || picked.current === value.date || value.end !== undefined) return;
    picked.current = value.date;
    const want = typeof value.start === "number" ? value.start : free[0].start;
    const best = [...free].sort((a, b) => Math.abs(a.start - want) - Math.abs(b.start - want))[0];
    onChange({ ...value, start: best.start, end: best.end });
  }, [free, value, onChange]);
  const time = (m: number) => `${two.format(Math.floor(m / 60))}:${two.format(m % 60)}`;
  return (
    <div className={classes.slotField}>
      <DateInput
        defaultValue={value.date ? new Date(`${value.date}T12:00:00`) : undefined}
        onChange={(d) => {
          onChange({ date: toYmd(d) });
        }}
      />
      {isLoading ? (
        <p className={ai.muted}>…</p>
      ) : data?.dayOff || (!!value.date && !free.length) ? (
        <p className={ai.muted}>{t(T("copNoFreeSlot", "در این روز نوبت خالی نیست"))}</p>
      ) : (
        <div className={ai.chips}>
          {free.map((s) => (
            <button
              key={`${s.start}-${s.end}`}
              type="button"
              className={`${ai.chip} ${value.start === s.start && value.end === s.end ? classes.chipOn : ""}`}
              aria-pressed={value.start === s.start && value.end === s.end}
              onClick={() => onChange({ ...value, start: s.start, end: s.end })}
            >
              {time(s.start)}
              {s.office?.name ? ` · ${s.office.name}` : ""}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const ConfirmCard = ({ profile, card, onDone }: { profile: AiProfile; card: Extract<CopilotCardData, { type: "confirm" }>; onDone: (msg: string) => void }) => {
  const t = useAiText(profile);
  const notify = useNotification();
  const intl = useIntlLocale();
  const [values, setValues] = useState<Record<string, unknown>>(() =>
    Object.fromEntries(card.fields.map((f) => [f.key, f.value ?? (f.type === "slot" ? {} : f.type === "lines" ? [] : "")])),
  );
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const set = (k: string, v: unknown) => setValues((p) => ({ ...p, [k]: v }));
  const missing = card.fields.some((f) => {
    if (!f.required) return false;
    const v = values[f.key];
    if (f.type === "slot") return !(v as SlotValue)?.date || (v as SlotValue)?.end === undefined;
    return v === "" || v === undefined || v === null;
  });

  const confirm = async () => {
    if (missing || busy) return;
    let path = card.request.path;
    const used = new Set<string>();
    path = path.replace(/\{(\w+)\}/g, (_, k: string) => {
      used.add(k);
      return encodeURIComponent(String(values[k] ?? ""));
    });
    const body: Record<string, unknown> = { ...(card.request.body || {}) };
    for (const f of card.fields) {
      if (used.has(f.key)) continue;
      const v = values[f.key];
      if (f.type === "slot") {
        const s = v as SlotValue;
        Object.assign(body, { date: s.date, start: s.start, end: s.end });
      } else if (f.type === "lines")
        body[f.key] = (v as Line[]).filter((l) => l.qty > 0).map(({ item, qty, unitCost }) => ({ item, qty, unitCost }));
      else if (f.type === "number") {
        if (v !== "" && v !== undefined) body[f.key] = Number(v);
      } else if (v !== "" && v !== undefined) body[f.key] = v;
    }
    setBusy(true);
    try {
      await fetcher({ url: `${API}${path}`, method: card.request.method, payload: body });
      setSent(true);
      const msg = t(card.done || T("copDone", "انجام شد"));
      notify(msg, "Success");
      onDone(msg);
    } catch (err) {
      notify((err as Error).message, "Error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={classes.form}>
      {!!card.text && <p className={ai.text}>{card.text}</p>}
      {card.fields.map((f) => {
        const v = values[f.key];
        const label = (
          <span className={classes.label}>
            {t(f.label)}
            {f.required ? " *" : ""}
          </span>
        );
        if (f.type === "slot")
          return (
            <div key={f.key} className={classes.field}>
              {label}
              <SlotField
                profile={profile}
                value={(v as SlotValue) || {}}
                sessionType={f.slot?.sessionTypeField ? String(values[f.slot.sessionTypeField] || "") : f.slot?.sessionType}
                except={f.slot?.exceptField ? String(values[f.slot.exceptField] || "") : undefined}
                onChange={(nv) => set(f.key, nv)}
              />
            </div>
          );
        if (f.type === "lines") {
          const rows = (v as Line[]) || [];
          const fmt = new Intl.NumberFormat(intl);
          return (
            <div key={f.key} className={classes.field}>
              {label}
              <div className={classes.lines}>
                {rows.map((l, i) => (
                  <div key={l.item} className={classes.line}>
                    <span className={classes.lineName}>{l.label}</span>
                    <input
                      type="number"
                      min={0}
                      inputMode="numeric"
                      value={l.qty}
                      aria-label={t(T("copFieldQty", "تعداد"))}
                      onChange={(e) => set(f.key, rows.map((r, j) => (j === i ? { ...r, qty: Number(e.target.value) || 0 } : r)))}
                    />
                    <input
                      type="number"
                      min={0}
                      inputMode="numeric"
                      value={l.unitCost}
                      aria-label={t(T("copFieldUnitCost", "بهای واحد"))}
                      onChange={(e) => set(f.key, rows.map((r, j) => (j === i ? { ...r, unitCost: Number(e.target.value) || 0 } : r)))}
                    />
                    <span className={ai.muted}>{fmt.format(l.qty * l.unitCost)}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        }
        return (
          <label key={f.key} className={classes.field}>
            {label}
            {f.type === "select" ? (
              <select value={String(v ?? "")} onChange={(e) => set(f.key, e.target.value)}>
                <option value="">—</option>
                {(f.options || []).map((o) => (
                  <option key={o.value} value={o.value}>
                    {typeof o.label === "string" ? o.label : t(o.label)}
                  </option>
                ))}
              </select>
            ) : f.type === "textarea" ? (
              <textarea rows={3} value={String(v ?? "")} onChange={(e) => set(f.key, e.target.value)} dir="auto" />
            ) : f.type === "date" ? (
              <DateInput
                defaultValue={v ? new Date(`${String(v)}T12:00:00`) : undefined}
                onChange={(d) => set(f.key, toYmd(d))}
              />
            ) : (
              <input
                type={f.type === "number" ? "number" : "text"}
                inputMode={f.type === "number" ? "decimal" : undefined}
                value={String(v ?? "")}
                onChange={(e) => set(f.key, e.target.value)}
                dir="auto"
              />
            )}
          </label>
        );
      })}
      <p className={ai.muted}>{t(T("copConfirmHint", "دستیار فقط فرم را پر کرده است. بررسی کنید و اگر درست است تأیید کنید."))}</p>
      <div className={classes.actions}>
        <Button size="S" onClick={confirm} isLoading={busy} variant={missing || sent ? "Disable" : "Primary"}>
          {sent ? t(T("copDone", "انجام شد")) : t(T("copConfirm", "تأیید و ثبت"))}
        </Button>
      </div>
    </div>
  );
};

type CallResult = {
  transcript: string;
  analysis: {
    summary: string;
    reason: string;
    requests: string[];
    sentiment: string;
    urgent: boolean;
    qualityScore: number | null;
    strengths: string[];
    improvements: string[];
    nextAction: string;
    followUpText: string;
    tags: string[];
  };
};

// Nexxa's call analysis, for a practice: a recorded patient call (file or
// the mic) -> transcript + summary, request, urgency, how it was handled
const CallAnalyzer = ({ profile, onAsk }: { profile: AiProfile; onAsk: (text: string) => void }) => {
  const t = useAiText(profile);
  const notify = useNotification();
  const intl = useIntlLocale();
  const rec = useVoiceRecorder();
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<CallResult | null>(null);
  const send = async (file: File) => {
    setBusy(true);
    try {
      const res = await fetcher({ url: `${aiBase(profile)}/call/analyze`, method: "POST", bodyParser: "FORM", payload: { audio: file } });
      setResult(res.data as CallResult);
    } catch (err) {
      notify((err as Error).message, "Error");
    } finally {
      setBusy(false);
    }
  };
  const a = result?.analysis;
  return (
    <div className={classes.form}>
      <p className={ai.muted}>{t(T("copCallHint", "فایل صدای تماس را بدهید یا تماس را روی بلندگو ضبط کنید. صدا ذخیره نمی‌شود."))}</p>
      <div className={classes.actions}>
        <label className={ai.aiButton}>
          <input
            type="file"
            accept="audio/*"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) send(f);
              e.target.value = "";
            }}
          />
          {t(T("copCallUpload", "انتخاب فایل صدا"))}
        </label>
        <button
          type="button"
          className={`${ai.mic} ${rec.recording ? ai.micOn : ""}`}
          disabled={busy}
          onClick={async () => {
            if (!rec.recording) {
              try {
                await rec.start();
              } catch {
                notify(t(T("aiMicDenied", "اجازه‌ی استفاده از میکروفون داده نشد")), "Error");
              }
              return;
            }
            const blob = await rec.stop();
            if (blob) send(audioFile(blob, "call"));
          }}
        >
          {rec.recording ? t(T("aiStopRecording", "پایان ضبط")) : t(T("copCallRecord", "ضبط تماس"))}
        </button>
        {busy && <span className={ai.muted}>{t(T("copAnalyzing", "در حال تحلیل…"))}</span>}
      </div>
      {!!a && (
        <div className={classes.callResult}>
          {a.urgent && <p className={`${ai.badge} ${ai.errBadge}`}>{t(T("copCallUrgent", "نشانه‌ی اورژانسی در تماس گفته شده است"))}</p>}
          <p className={ai.text}>{a.summary}</p>
          {!!a.reason && (
            <p className={ai.text}>
              <strong>{t(T("copCallReason", "علت تماس"))}: </strong>
              {a.reason}
            </p>
          )}
          {typeof a.qualityScore === "number" && (
            <p className={ai.muted}>
              {t(T("copCallQuality", "کیفیت پاسخ‌گویی"))}: {new Intl.NumberFormat(intl).format(a.qualityScore)}/{new Intl.NumberFormat(intl).format(100)}
            </p>
          )}
          {!!a.improvements.length && (
            <ul className={ai.list}>
              {a.improvements.map((x) => (
                <li key={x}>• {x}</li>
              ))}
            </ul>
          )}
          {!!a.nextAction && (
            <p className={ai.text}>
              <strong>{t(T("copNextAction", "اقدام بعدی"))}: </strong>
              {a.nextAction}
            </p>
          )}
          {!!a.followUpText && (
            <button type="button" className={ai.aiButton} onClick={() => onAsk(`${t(T("copMakeFollowUp", "یک پیگیری بساز"))}: ${a.followUpText}`)}>
              {t(T("copMakeFollowUp", "یک پیگیری بساز"))}
            </button>
          )}
          <details>
            <summary className={ai.muted}>{t(T("copTranscript", "متن تماس"))}</summary>
            <p className={ai.text}>{result?.transcript}</p>
          </details>
        </div>
      )}
    </div>
  );
};

const CopilotCard = ({
  profile,
  card,
  onAsk,
  onDone,
}: {
  profile: AiProfile;
  card: CopilotCardData;
  onAsk: (text: string) => void;
  onDone: (msg: string) => void;
}) => {
  const t = useAiText(profile);
  const push = useProgress();
  const admin = profile === "admin";
  if (card.type === "message") return <p className={ai.muted}>{card.raw || t(card.text)}</p>;
  if (card.type === "navigate")
    return (
      <p className={ai.muted}>
        {card.title ? `${t(card.title)} · ` : ""}
        <button type="button" className={classes.link} onClick={() => (admin || card.path.startsWith("/wizard") ? (window.location.href = card.path) : push(card.path))}>
          {t(T("copOpenPage", "باز کردن صفحه"))}
        </button>
      </p>
    );
  if (card.type === "callAnalyze")
    return (
      <div className={ai.card}>
        <span className={ai.cardTitle}>{t(card.title)}</span>
        <CallAnalyzer profile={profile} onAsk={onAsk} />
      </div>
    );
  return (
    <div className={ai.card}>
      <div className={ai.cardHead}>
        <span className={ai.cardTitle}>{t(card.title)}</span>
        {card.type !== "confirm" && card.link && (
          <Go href={card.link} admin={admin}>
            <span className={classes.link}>{t(T("copSeeAll", "همه"))}</span>
          </Go>
        )}
        {card.type === "confirm" && <span className={ai.badge}>{t(T("copNeedsConfirm", "نیاز به تأیید"))}</span>}
      </div>
      {card.type === "confirm" ? (
        <ConfirmCard profile={profile} card={card} onDone={onDone} />
      ) : (
        <>
          {!!card.text && <p className={ai.text}>{card.text}</p>}
          {!!card.rows?.length && (
            <ul className={classes.rows}>
              {card.rows.map((r, i) => (
                <li key={`${r.title}-${i}`} className={classes.row}>
                  <span className={classes.rowMain}>
                    {r.link ? (
                      <Go href={r.link} admin={admin}>
                        {r.title || "—"}
                      </Go>
                    ) : (
                      <span>{r.title}</span>
                    )}
                    {!!r.sub && <span className={ai.muted}>{r.sub}</span>}
                  </span>
                  {r.badge && <span className={ai.badge}>{t(r.badge)}</span>}
                </li>
              ))}
            </ul>
          )}
          {card.type === "list" && !card.rows?.length && <p className={ai.muted}>{t(card.empty || T("copNothingFound", "چیزی پیدا نشد"))}</p>}
        </>
      )}
    </div>
  );
};

export default CopilotCard;
