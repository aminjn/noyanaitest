"use client";
import { TEHRAN_TZ } from "@/Components/helpers/tehranTime";

import { useEffect, useMemo, useRef, useState } from "react";
import useSWR from "swr";
import classes from "./Visit.module.css";
import { API } from "../config";
import { fetcher } from "../helpers/fetcher";
import useScopedLocale from "../Hooks/useScopedLocale";
import useNotification from "../Hooks/useNotification";
import { ContentNamespace } from "../Enums/contentNamespaces";
import { ContentKey } from "../Enums/contentKeys";
import { useIntlLocale } from "../i18n/navigation";
import Ixon from "../UI/Ixon";
import AiOrb from "../UI/AiOrb";
import SparkIcon from "../Icons/SparkIcon";
import MicrophoneIcon from "../Icons/MicrophoneIcon";
import IntakeAnswers from "./IntakeAnswers";
import Link from "../i18n/Link";
import { IVisitIntake, IVisitNote } from "./visitTypes";
import { safeFormatDate } from "@/Components/helpers/safeFormatDate";
import AiLocked, { aiGateOf, AiFeatureState, AiGateInfo, AiQuota, gateOfState } from "../Ai/AiLocked";

const NS: ContentNamespace[] = ["common", "doctorPanelBooking"];

type VisitRecord = {
  intake: IVisitIntake | null;
  note: IVisitNote | null;
  // aiInPlan: the AI policy lets this doctor draft notes (2026-10; by
  // default the plan's AI assistant module); features: the scribe's and the
  // draft's state and quota
  capabilities: { ai: boolean; stt: boolean; aiInPlan?: boolean; features?: Record<string, AiFeatureState> };
};

type NoteFields = Required<Pick<IVisitNote, "subjective" | "objective" | "assessment" | "plan" | "patientInstructions">>;

const SECTIONS: { key: keyof NoteFields; label: ContentKey; rows: number }[] = [
  { key: "subjective", label: "visitNoteSubjective", rows: 3 },
  { key: "objective", label: "visitNoteObjective", rows: 2 },
  { key: "assessment", label: "visitNoteAssessment", rows: 2 },
  { key: "plan", label: "visitNotePlan", rows: 3 },
  { key: "patientInstructions", label: "visitNotePatientInstructions", rows: 2 },
];

const emptyFields = (note?: IVisitNote | null): NoteFields => ({
  subjective: note?.subjective || "",
  objective: note?.objective || "",
  assessment: note?.assessment || "",
  plan: note?.plan || "",
  patientInstructions: note?.patientInstructions || "",
});

const useRecordRecorder = () => {
  const recorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (!recording) return;
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [recording]);

  const start = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const type = MediaRecorder.isTypeSupported("audio/webm;codecs=opus") ? "audio/webm;codecs=opus" : "";
    // 32 kbps: the rate the server counts scribe minutes by (Lib/ai/aiGate.ts)
    const rec = new MediaRecorder(stream, { ...(type ? { mimeType: type } : {}), audioBitsPerSecond: 32000 });
    chunks.current = [];
    rec.ondataavailable = (e) => e.data.size && chunks.current.push(e.data);
    rec.start(1000);
    recorder.current = rec;
    setSeconds(0);
    setRecording(true);
  };

  const stop = () =>
    new Promise<Blob | null>((resolve) => {
      const rec = recorder.current;
      if (!rec) return resolve(null);
      rec.onstop = () => {
        rec.stream.getTracks().forEach((t) => t.stop());
        resolve(new Blob(chunks.current, { type: rec.mimeType || "audio/webm" }));
      };
      rec.stop();
      recorder.current = null;
      setRecording(false);
    });

  return { recording, seconds, start, stop };
};

// Doctor's side of one visit: the patient's pre-visit answers (with the
// assistant's summary) and the SOAP note with the AI scribe.
const DoctorVisitPanel = ({ reservationId }: { reservationId: string }) => {
  const getContent = useScopedLocale(NS);
  const notify = useNotification();
  const intlTag = useIntlLocale();
  const num = useMemo(() => new Intl.NumberFormat(intlTag), [intlTag]);
  const clock = useMemo(() => new Intl.DateTimeFormat(intlTag, { timeZone: TEHRAN_TZ, hour: "2-digit", minute: "2-digit" }), [intlTag]);
  const base = `${API}/doctor/reservation/${reservationId}/visit`;
  const { data, error, mutate } = useSWR<VisitRecord>(base, (u: string) => fetcher({ url: u }).then((r) => r.data), {
    shouldRetryOnError: false,
  });

  const [fields, setFields] = useState<NoteFields>(emptyFields());
  const [transcript, setTranscript] = useState("");
  const [aiAssisted, setAiAssisted] = useState(false);
  const [busy, setBusy] = useState<"" | "draft" | "stt" | "save">("");
  const [dirty, setDirty] = useState(false);
  const [draftFresh, setDraftFresh] = useState(false);
  // a refusal of the AI policy (plan, quota): shown as the locked state
  const [refused, setRefused] = useState<AiGateInfo | null>(null);
  const rec = useRecordRecorder();

  useEffect(() => {
    if (!data) return;
    setFields(emptyFields(data.note));
    setTranscript(data.note?.transcript || "");
    setAiAssisted(!!data.note?.aiAssisted);
    setDirty(false);
  }, [data]);

  const ownerOnly = (error as { status?: number } | undefined)?.status === 403;
  if (ownerOnly)
    return (
      <section className={classes.card}>
        <p className={classes.muted}>{getContent("visitOwnerOnly")}</p>
      </section>
    );
  if (!data) return null;
  const { intake, note } = data;
  const capabilities = data.capabilities || { ai: false, stt: false };
  const draftState = capabilities.features?.["clinical.noteDraft"];
  const scribeState = capabilities.features?.["clinical.scribe"];

  const edit = (key: keyof NoteFields, value: string) => {
    setFields((f) => ({ ...f, [key]: value }));
    setDirty(true);
  };

  const record = async () => {
    if (rec.recording) {
      const seconds = rec.seconds;
      const blob = await rec.stop();
      if (!blob?.size) return;
      setBusy("stt");
      try {
        const res = await fetcher({
          url: `${base}/transcribe`,
          method: "POST",
          bodyParser: "FORM",
          payload: { audio: new File([blob], "visit.webm", { type: blob.type }), seconds: String(seconds) },
        });
        const text = String(res.data?.text || "").trim();
        if (text) {
          setTranscript((t) => (t ? `${t}\n${text}` : text));
          setDirty(true);
        }
      } catch (err) {
        const g = aiGateOf(err);
        if (g) setRefused(g);
        else notify((err as Error).message, "Error");
      } finally {
        setBusy("");
      }
      return;
    }
    try {
      await rec.start();
    } catch {
      notify(getContent("visitMicDenied"), "Error");
    }
  };

  const draft = async () => {
    setBusy("draft");
    try {
      const res = await fetcher({ url: `${base}/draft`, method: "POST", payload: { transcript } });
      const d = res.data || {};
      // the draft fills empty sections only: what the doctor already wrote wins
      setFields((f) => {
        const next = { ...f };
        for (const s of SECTIONS)
          if (!f[s.key].trim() && typeof d[s.key] === "string" && d[s.key].trim()) next[s.key] = d[s.key];
        return next;
      });
      setAiAssisted(true);
      setDraftFresh(true);
      setDirty(true);
      notify(getContent("visitDraftReady"), "Notify");
    } catch (err) {
      const g = aiGateOf(err);
      if (g) setRefused(g);
      else notify((err as Error).message, "Error");
    } finally {
      setBusy("");
    }
  };

  const save = async () => {
    setBusy("save");
    try {
      const res = await fetcher({
        url: `${base}/note`,
        method: "PUT",
        payload: { ...fields, transcript, aiAssisted },
      });
      await mutate({ ...data, note: res.data }, { revalidate: false });
      setDraftFresh(false);
      setDirty(false);
      notify(getContent("visitNoteSaved"), "Success");
    } catch (err) {
      notify((err as Error).message, "Error");
    } finally {
      setBusy("");
    }
  };

  const mm = (s: number) => `${num.format(Math.floor(s / 60)).padStart(2, num.format(0))}:${num.format(s % 60).padStart(2, num.format(0))}`;

  return (
    <div className={classes.visit}>
      {/* ---- the note ---- */}
      <section className={`${classes.card} ${classes.noteCard}`} aria-labelledby="visit-note">
        <div className={classes.cardHead}>
          <span className={`${classes.headIcon} glassIcon tone-violet`}>
            <Ixon width="1.1rem">
              <SparkIcon />
            </Ixon>
          </span>
          <div className={classes.headText}>
            <h2 id="visit-note" className={classes.cardTitle}>
              {getContent("visitNoteTitle")}
            </h2>
            {note?.updatedAt && (
              <span className={classes.muted}>
                {getContent("visitNoteLastSaved", [safeFormatDate(clock, note.updatedAt)])}
              </span>
            )}
          </div>
          {aiAssisted && <span className={classes.aiBadge}>{getContent("visitAiBadge")}</span>}
        </div>

        <div className={classes.scribe}>
          <label className={classes.field}>
            <span className={classes.label}>{getContent("visitTranscript")}</span>
            <textarea
              rows={4}
              maxLength={30000}
              value={transcript}
              placeholder={getContent("visitTranscriptPlaceholder")}
              onChange={(e) => {
                setTranscript(e.target.value);
                setDirty(true);
              }}
            />
          </label>
          <div className={classes.scribeActions}>
            {capabilities.stt && (
              <button
                type="button"
                className={`${classes.recordBtn} ${rec.recording ? classes.recording : ""}`}
                onClick={record}
                disabled={busy === "stt"}
                aria-pressed={rec.recording}
              >
                <Ixon width="1.05rem">
                  <MicrophoneIcon />
                </Ixon>
                {rec.recording
                  ? `${getContent("visitStopRecording")} · ${mm(rec.seconds)}`
                  : busy === "stt"
                    ? getContent("visitTranscribing")
                    : getContent("visitRecord")}
              </button>
            )}
            {capabilities.ai && (
              <button
                type="button"
                className={classes.aiBtn}
                onClick={draft}
                disabled={!!busy || rec.recording || transcript.trim().length < 10}
              >
                <Ixon width="1rem">
                  <SparkIcon />
                </Ixon>
                {busy === "draft" ? getContent("visitDrafting") : getContent("visitDraft")}
              </button>
            )}
          </div>
          {/* the AI policy: locked by plan / quota (with the upgrade link and
              the reset time), off, or the minutes left today */}
          {refused || gateOfState(draftState) || gateOfState(scribeState) ? (
            <AiLocked profile="doctor" gate={refused || gateOfState(draftState) || gateOfState(scribeState)} compact />
          ) : (
            !capabilities.ai &&
            (capabilities.aiInPlan === false ? (
              <Link href="/doctorpanel/license" className={classes.muted}>
                {getContent("visitAiNotInPlan")}
              </Link>
            ) : (
              <span className={classes.muted}>{getContent("visitAiOff")}</span>
            ))
          )}
          {capabilities.stt && <AiQuota profile="doctor" state={scribeState} />}
        </div>

        {draftFresh && <div className={classes.draftNote}>{getContent("visitDraftReady")}</div>}

        <div className={classes.sections}>
          {SECTIONS.map((s) => (
            <label key={s.key} className={classes.field}>
              <span className={classes.label}>{getContent(s.label)}</span>
              <textarea rows={s.rows} maxLength={5000} value={fields[s.key]} onChange={(e) => edit(s.key, e.target.value)} />
              {s.key === "patientInstructions" && (
                <span className={classes.muted}>{getContent("visitNotePatientVisible")}</span>
              )}
            </label>
          ))}
        </div>

        <div className={classes.noteFooter}>
          <span className={classes.muted}>{getContent("visitNotePrivacy")}</span>
          <button type="button" className={classes.primaryBtn} onClick={save} disabled={!!busy || !dirty}>
            {getContent("visitNoteSave")}
          </button>
        </div>
      </section>

      {/* ---- what the patient told us ---- */}
      <section className={classes.card} aria-labelledby="visit-intake">
        <div className={classes.cardHead}>
          <AiOrb size="2.25rem" />
          <div className={classes.headText}>
            <h2 id="visit-intake" className={classes.cardTitle}>
              {getContent("visitIntakeTitle")}
            </h2>
            <span className={classes.muted}>{getContent("visitDoctorDecides")}</span>
          </div>
        </div>
        {!intake ? (
          <p className={classes.muted}>{getContent("visitIntakeMissing")}</p>
        ) : (
          <>
            {intake.aiSummary && (
              <div className={classes.aiBox}>
                <span className={classes.aiLabel}>
                  <Ixon width="0.85rem">
                    <SparkIcon />
                  </Ixon>
                  {getContent("visitAiSummary")}
                </span>
                <p>{intake.aiSummary}</p>
                {Array.isArray(intake.aiQuestions) && intake.aiQuestions.length > 0 && (
                  <>
                    <span className={classes.aiLabel}>{getContent("visitAiQuestions")}</span>
                    <ul className={classes.questions}>
                      {intake.aiQuestions.map((q) => (
                        <li key={q}>{q}</li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            )}
            <IntakeAnswers intake={intake} ns={NS} />
          </>
        )}
      </section>
    </div>
  );
};

export default DoctorVisitPanel;
