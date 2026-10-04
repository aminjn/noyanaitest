"use client";

import { useState } from "react";
import { fetcher } from "@/Components/helpers/fetcher";
import useNotification from "@/Components/Hooks/useNotification";
import Ixon from "@/Components/UI/Ixon";
import SparkIcon from "@/Components/Icons/SparkIcon";
import AiSetupNotice from "@/Components/Ai/AiSetupNotice";
import { aiBase, T, useAiStatus, useAiText } from "@/Components/Ai/aiShared";
import ai from "@/Components/Ai/Ai.module.css";

type Summary = {
  summary: string;
  problems: string[];
  medications: string[];
  allergies: string[];
  openItems: string[];
  sources: { visits: number; notes: number; intakes: number };
};

// The patient's history with this doctor in a few lines (2026-10): visits,
// SOAP notes and pre-visit questionnaires read by the clinical assistant.
// Owner only (clinical data, like the visit note); a draft to read, never a
// diagnosis. Generated on request, not stored.
const PatientAiSummary = ({ patientId }: { patientId: string }) => {
  const { status, ok } = useAiStatus("doctor");
  const t = useAiText("doctor");
  const notify = useNotification();
  const [busy, setBusy] = useState(false);
  const [data, setData] = useState<Summary | null>(null);
  if (!status || !status.owner) return null;

  const load = async () => {
    setBusy(true);
    try {
      const res = await fetcher({ url: `${aiBase("doctor")}/patient/${patientId}/summary`, method: "POST" });
      setData(res.data as Summary);
    } catch (err) {
      notify((err as Error).message, "Error");
    } finally {
      setBusy(false);
    }
  };

  const list = (title: string, rows: string[]) =>
    rows.length ? (
      <div>
        <strong className={ai.muted}>{title}</strong>
        <ul className={ai.list}>
          {rows.map((r) => (
            <li key={r}>• {r}</li>
          ))}
        </ul>
      </div>
    ) : null;

  return (
    <section className={ai.card}>
      <div className={ai.cardHead}>
        <span className={ai.cardTitle}>{t(T("patAiTitle", "خلاصه‌ی پرونده با هوش مصنوعی"))}</span>
        {ok && (
          <button type="button" className={ai.aiButton} onClick={load} disabled={busy}>
            <Ixon width="0.9rem">
              <SparkIcon />
            </Ixon>
            {busy ? t(T("aiThinking", "در حال آماده‌سازی…")) : data ? t(T("patAiRefresh", "دوباره")) : t(T("patAiMake", "خلاصه کن"))}
          </button>
        )}
      </div>
      <AiSetupNotice profile="doctor" status={status} />
      {ok && !data && <p className={ai.muted}>{t(T("patAiHint", "ویزیت‌ها، یادداشت‌ها و پرسش‌نامه‌های این بیمار نزد شما در چند خط؛ فقط برای مرور، نه تشخیص."))}</p>}
      {!!data && (
        <>
          {data.sources.visits === 0 ? (
            <p className={ai.muted}>{t(T("patAiEmpty", "هنوز ویزیتی از این بیمار نزد شما ثبت نشده است."))}</p>
          ) : (
            <p className={ai.text}>{data.summary}</p>
          )}
          {list(t(T("patAiProblems", "مشکلات")), data.problems)}
          {list(t(T("patAiMeds", "داروها")), data.medications)}
          {list(t(T("patAiAllergies", "حساسیت‌ها")), data.allergies)}
          {list(t(T("patAiOpen", "کارهای باز")), data.openItems)}
          <p className={ai.muted}>{t(T("patAiDisclaimer", "متن را دستیار از داده‌های ثبت‌شده ساخته است؛ پیش از تصمیم، پرونده را ببینید."))}</p>
        </>
      )}
    </section>
  );
};

export default PatientAiSummary;
