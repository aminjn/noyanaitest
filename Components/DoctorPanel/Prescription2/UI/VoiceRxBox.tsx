"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import useNotification from "@/Components/Hooks/useNotification";
import Button from "@/Components/UI/Button";
import Ixon from "@/Components/UI/Ixon";
import SparkIcon from "@/Components/Icons/SparkIcon";
import VoiceButton from "@/Components/Ai/VoiceButton";
import AiSetupNotice from "@/Components/Ai/AiSetupNotice";
import { T, useAiStatus, useAiText } from "@/Components/Ai/aiShared";
import AiLocked, { aiGateOf, AiGateInfo, gateOfState } from "@/Components/Ai/AiLocked";
import { ITaminService } from "@/Components/Admin/Tamin/Service/AdminManageTaminServicesPage";
import usePrescription from "../Store/usePrescription";
import { newPrescription2ItemId, PrescCtxItem, RxAiWarning } from "../Store/DoctorPrescriptionContext";
import ai from "@/Components/Ai/Ai.module.css";
import classes from "./VoiceRxBox.module.css";

// the texts of this box, with their Persian source (keys handed off for
// the 15 message files; until merged the Persian shows)
export const RX_TEXT: Record<string, string> = {
  rxAiTitle: "نسخه با صدا یا متن",
  rxAiHint: "داروها و آزمایش‌ها را بگویید یا بنویسید؛ فرم به‌صورت پیش‌نویس پر می‌شود و شما بررسی و امضا می‌کنید.",
  rxAiPlaceholder: "مثلاً: آموکسی‌سیلین ۵۰۰ هر ۸ ساعت ۷ روز، ایبوپروفن ۴۰۰ بعد از غذا، سی‌بی‌سی",
  rxAiFill: "پر کردن فرم",
  rxAiNoPatient: "بیمار را انتخاب کنید تا حساسیت‌ها و داروهای فعلی او هم بررسی شود.",
  rxAiAllergies: "حساسیت‌ها (پرسش‌نامه)",
  rxAiCurrentMeds: "داروهای فعلی (پرسش‌نامه)",
  rxAiUnmatched: "این موارد در فهرست تأمین پیدا نشد یا چند گزینه دارد؛ یکی را انتخاب کنید:",
  rxAiNoMatch: "پیدا نشد",
  rxAiSearchByHand: "جستجو در فرم",
  rxAiDrop: "حذف",
  rxAiSafety: "هشدارها فقط برای یادآوری‌اند و تصمیم با پزشک است. هیچ نسخه‌ای بدون تأیید شما ثبت نمی‌شود.",
  rxAiAdded: "${1} ردیف به فرم اضافه شد؛ ${2} مورد نیاز به انتخاب دارد.",
  rxAiFromVoice: "از صدا — بررسی کنید",
  rxAiReviewed: "بررسی کردم",
  rxAiReviewFirst: "ردیف‌هایی که از صدا آمده‌اند را اول بررسی و تأیید کنید.",
  rxWarn_allergy: "حساسیت ثبت‌شده‌ی بیمار («${1}») با «${2}» یکی است",
  rxWarn_allergyClass: "حساسیت ثبت‌شده‌ی بیمار («${1}») ممکن است شامل «${2}» هم باشد",
  rxWarn_duplicateInList: "«${1}» دو بار گفته شده است",
  rxWarn_duplicateExisting: "«${1}» در نسخه هست",
  rxWarn_currentMedication: "بیمار گفته این دارو را مصرف می‌کند: ${1}",
  rxWarn_sameClass: "«${1}» و «${2}» از یک دسته‌ی دارویی‌اند",
  rxWarn_doseHigh: "مقدار روزانه‌ی «${1}» حدود ${2} میلی‌گرم است؛ بیشینه‌ی معمول ${3} میلی‌گرم",
  rxWarn_frequencyHigh: "دفعات مصرف «${1}» در روز زیاد است",
  rxWarn_durationLong: "مدت مصرف «${1}» بیش از ۹۰ روز است",
  rxWarn_quantityHigh: "تعداد «${1}» زیاد است",
  rxWarn_quantityMissing: "تعداد گفته نشد؛ تعداد را وارد کنید",
  rxWarn_unmatched: "در فهرست تأمین پیدا نشد",
  rxWarn_timingMissing: "مقدار یا زمان مصرف را انتخاب کنید",
  rxWarn_warfarinNsaid: "مصرف «${1}» همراه وارفارین خطر خونریزی دارد",
};

// Voice / free-text prescription (2026-10). The doctor says or types the
// medicines ("آموکسی‌سیلین ۵۰۰ هر ۸ ساعت ۷ روز") and the lab / imaging
// orders; the server (POST /ai/doctor/rx/parse) extracts them, matches each
// to the Tamin catalogue and the admin's «مقادیر مصرف» / «زمان مصرف» /
// «طریقه مصرف» codes, and flags allergy / duplicate / dose hints from the
// patient's questionnaire. The lines land in the form as a DRAFT, marked
// «از صدا — بررسی کنید»; unmatched ones wait here for the doctor to pick a
// candidate or search by hand. Nothing is submitted: the doctor reviews each
// line, then drafts or commits the prescription as usual.

type Candidate = { _id: string; srvType?: string; srvCode?: string; srvName?: string; srvName2?: string; score: number };
type Coded = { _id: string; [k: string]: unknown };
type DraftItem = {
  key: string;
  spoken: string;
  latin: string;
  strength: string;
  matched: Candidate | null;
  candidates: Candidate[];
  timesADay: Coded | null;
  drugInstruction: Coded | null;
  qty: number | null;
  dose: string;
  warnings: RxAiWarning[];
};
type DraftOrder = { key: string; spoken: string; latin: string; kind: string; notes: string; matched: Candidate | null; candidates: Candidate[] };
type Parsed = { items: DraftItem[]; orders: DraftOrder[]; patient: { allergies: string; medications: string } };

// a text of the box / one warning in the doctor's language
export const useRxText = () => {
  const t = useAiText("doctor");
  return useCallback((key: string, vars?: string[]) => t(T(key, RX_TEXT[key] || key), vars), [t]);
};
export const useRxWarningText = () => {
  const tx = useRxText();
  return useCallback((w: RxAiWarning) => tx(`rxWarn_${w.code}`, w.params || []), [tx]);
};

const serviceName = (c: Candidate) => c.srvName || c.srvName2 || "";

const VoiceRxBox = () => {
  const getContent = useRxText();
  const warnText = useRxWarningText();
  const notify = useNotification();
  const { status, mutate } = useAiStatus("doctor");
  // the AI policy's "clinical.rx": usable, locked by plan / quota, or off
  const rxFeature = status?.features?.["clinical.rx"];
  const [refused, setRefused] = useState<AiGateInfo | null>(null);
  const gate = refused || gateOfState(rxFeature);
  const ok = !!status?.configured && rxFeature?.state === "ok" && !refused;
  const { items, setItems, patient, setAiMarks, setWorking, setView, readOnly } = usePrescription();
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [pending, setPending] = useState<(DraftItem | DraftOrder)[]>([]);
  const [context, setContext] = useState<Parsed["patient"] | null>(null);
  const params = useSearchParams();
  const fromCopilot = useRef(false);

  const addLine = useCallback(
    (service: Candidate, d: Partial<DraftItem> & { spoken: string; warnings?: RxAiWarning[] }) => {
      const id = newPrescription2ItemId();
      const line = {
        _id: id,
        service: service as unknown as ITaminService,
        qty: d.qty || 1,
        ...(d.timesADay ? { timesADay: d.timesADay } : {}),
        ...(d.drugInstruction ? { drugInstruction: d.drugInstruction } : {}),
        ...(d.dose ? { dose: d.dose } : {}),
      } as unknown as PrescCtxItem;
      setItems((prev) => [...prev, line]);
      const warnings = [...(d.warnings || [])].filter((w) => w.code !== "unmatched");
      if (Number(service.srvType) === 1 && (!d.timesADay || !d.drugInstruction)) warnings.push({ code: "timingMissing" });
      setAiMarks((prev) => ({ ...prev, [id]: { spoken: d.spoken, warnings } }));
      setView((prev) => ({ ...prev, preview: String(service.srvType || "") }));
    },
    [setAiMarks, setItems, setView],
  );

  const parse = useCallback(
    async (input: string) => {
      const q = input.trim();
      if (q.length < 2 || busy) return;
      setBusy(true);
      try {
        const res = await fetcher({
          url: `${API}/ai/doctor/rx/parse`,
          method: "POST",
          payload: {
            text: q,
            patient: patient?._id || null,
            existing: items.map((i) => ({ service: i.service?._id, name: i.service?.srvName || "" })),
          },
        });
        const d = (res?.data || {}) as Parsed;
        const draftItems = Array.isArray(d.items) ? d.items : [];
        const orders = Array.isArray(d.orders) ? d.orders : [];
        let added = 0;
        const left: (DraftItem | DraftOrder)[] = [];
        for (const it of draftItems) {
          if (it.matched) {
            addLine(it.matched, it);
            added++;
          } else left.push(it);
        }
        for (const o of orders) {
          if (o.matched) {
            addLine(o.matched, { spoken: o.spoken, qty: 1, dose: o.notes, warnings: [] });
            added++;
          } else left.push(o);
        }
        setPending(left);
        setContext(d.patient && (d.patient.allergies || d.patient.medications) ? d.patient : null);
        setText("");
        notify(getContent("rxAiAdded", [String(added), String(left.length)]), added ? "Success" : "Warn");
        mutate();
      } catch (err) {
        const g = aiGateOf(err);
        if (g) setRefused(g);
        else notify((err as Error).message, "Error");
      } finally {
        setBusy(false);
      }
    },
    [addLine, busy, getContent, items, notify, patient?._id, mutate],
  );

  // the copilot opened the writer with the dictated medicines (?rx=...)
  useEffect(() => {
    const rx = params?.get("rx");
    if (!rx || fromCopilot.current || !ok) return;
    fromCopilot.current = true;
    setText(rx);
    parse(rx);
  }, [ok, params, parse]);

  if (readOnly) return null;
  // switched off by the super admin: no box at all
  if (rxFeature?.state === "off") return null;
  return (
    <section className={classes.box} aria-label={getContent("rxAiTitle")}>
      <div className={classes.head}>
        <span className={classes.icon} aria-hidden>
          <Ixon width="1.125rem">
            <SparkIcon />
          </Ixon>
        </span>
        <div className={classes.headText}>
          <span className={classes.title}>{getContent("rxAiTitle")}</span>
          <span className={ai.muted}>{getContent("rxAiHint")}</span>
        </div>
      </div>
      {!ok ? (
        status?.configured && gate ? (
          <AiLocked profile="doctor" gate={gate} />
        ) : (
          <AiSetupNotice profile="doctor" status={status} />
        )
      ) : (
        <>
          <div className={classes.inputRow}>
            <textarea
              className={classes.input}
              rows={2}
              dir="auto"
              value={text}
              placeholder={getContent("rxAiPlaceholder")}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) parse(text);
              }}
            />
            <div className={classes.inputActions}>
              {status?.stt && <VoiceButton profile="doctor" onText={(v) => (setText(v), parse(v))} disabled={busy} />}
              <Button size="S" onClick={() => parse(text)} isLoading={busy} variant={text.trim().length < 2 ? "Disable" : "Primary"}>
                {getContent("rxAiFill")}
              </Button>
            </div>
          </div>
          {!patient && <p className={ai.muted}>{getContent("rxAiNoPatient")}</p>}
          {!!context && (
            <p className={`${ai.notice}`}>
              {context.allergies && (
                <span>
                  <strong>{getContent("rxAiAllergies")}:</strong> {context.allergies}
                </span>
              )}
              {context.medications && (
                <span>
                  <strong>{getContent("rxAiCurrentMeds")}:</strong> {context.medications}
                </span>
              )}
            </p>
          )}
          {!!pending.length && (
            <div className={classes.pending}>
              <span className={classes.pendingTitle}>{getContent("rxAiUnmatched")}</span>
              {pending.map((p) => (
                <div key={p.key} className={classes.pendingRow}>
                  <div className={classes.pendingHead}>
                    <strong dir="auto">{p.spoken || p.latin}</strong>
                    {!!p.latin && p.spoken && <span className={ai.muted}>({p.latin})</span>}
                    <span className={`${ai.badge} ${ai.warnBadge}`}>{getContent("rxAiNoMatch")}</span>
                  </div>
                  <div className={ai.chips}>
                    {p.candidates.map((c) => (
                      <button
                        key={c._id}
                        type="button"
                        className={ai.chip}
                        onClick={() => {
                          addLine(c, "warnings" in p ? p : { spoken: p.spoken, qty: 1, dose: p.notes, warnings: [] });
                          setPending((all) => all.filter((x) => x.key !== p.key));
                        }}
                      >
                        {serviceName(c)}
                      </button>
                    ))}
                    <button
                      type="button"
                      className={ai.chip}
                      onClick={() => {
                        setWorking({ _id: newPrescription2ItemId(), qty: ("qty" in p && p.qty) || 1, dose: [p.spoken, "dose" in p ? p.dose : p.notes].filter(Boolean).join(" · ") });
                        setPending((all) => all.filter((x) => x.key !== p.key));
                      }}
                    >
                      {getContent("rxAiSearchByHand")}
                    </button>
                    <button type="button" className={ai.chip} onClick={() => setPending((all) => all.filter((x) => x.key !== p.key))}>
                      {getContent("rxAiDrop")}
                    </button>
                  </div>
                  {"warnings" in p &&
                    p.warnings
                      .filter((w) => w.code !== "unmatched")
                      .map((w, i) => (
                        <span key={i} className={classes.warn}>
                          ⚠ {warnText(w)}
                        </span>
                      ))}
                </div>
              ))}
            </div>
          )}
          <p className={ai.muted}>{getContent("rxAiSafety")}</p>
        </>
      )}
    </section>
  );
};

export default VoiceRxBox;
