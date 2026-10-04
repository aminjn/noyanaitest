"use client";

import useSiteSettings from "@/Components/Hooks/useSiteSettings";
import { FormEvent, useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import classes from "./Visit.module.css";
import { API } from "../config";
import { fetcher } from "../helpers/fetcher";
import useScopedLocale from "../Hooks/useScopedLocale";
import useNotification from "../Hooks/useNotification";
import { ContentNamespace } from "../Enums/contentNamespaces";
import { useIntlLocale } from "../i18n/navigation";
import Ixon from "../UI/Ixon";
import SparkIcon from "../Icons/SparkIcon";
import IntakeAnswers from "./IntakeAnswers";
import {
  IVisitIntake,
  IntakeCondition,
  IntakeOnset,
  IntakeRedFlag,
  conditionKeys,
  intakeConditions,
  intakeOnsets,
  intakeRedFlags,
  known,
  onsetKeys,
  redFlagKeys,
} from "./visitTypes";

const NS: ContentNamespace[] = ["common", "dashboardBooking"];

type IntakeResponse = { intake: IVisitIntake | null; editable: boolean };

type Draft = {
  complaint: string;
  onset?: IntakeOnset;
  severity: number;
  conditions: IntakeCondition[];
  medications: string;
  allergies: string;
  redFlags: IntakeRedFlag[];
  notes: string;
};

const toDraft = (intake?: IVisitIntake | null): Draft => ({
  complaint: intake?.complaint || "",
  onset: known(intakeOnsets, [intake?.onset])[0],
  severity: typeof intake?.severity === "number" ? intake.severity : 5,
  conditions: known(intakeConditions, intake?.conditions),
  medications: intake?.medications || "",
  allergies: intake?.allergies || "",
  redFlags: known(intakeRedFlags, intake?.redFlags),
  notes: intake?.notes || "",
});

const toggle = <T,>(list: T[], value: T) =>
  list.includes(value) ? list.filter((v) => v !== value) : [...list, value];

// Structured pre-visit questionnaire on the patient's booking page
// (Amazon One Medical / K Health style intake, not a free chat).
const PatientIntakeCard = ({ reservationId }: { reservationId: string }) => {
  const getContent = useScopedLocale(NS);
  const { emergencyNumberText } = useSiteSettings();
  const notify = useNotification();
  const intlTag = useIntlLocale();
  const num = useMemo(() => new Intl.NumberFormat(intlTag), [intlTag]);
  const url = `${API}/user/reservation/${reservationId}/intake`;
  const { data, mutate } = useSWR<IntakeResponse>(url, (u: string) => fetcher({ url: u }).then((r) => r.data));

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState<Draft>(toDraft());

  useEffect(() => {
    if (data) setDraft(toDraft(data.intake));
  }, [data]);

  if (!data) return null;
  const { intake, editable } = data;
  if (!intake && !editable) return null;

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft((d) => ({ ...d, [key]: value }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (draft.complaint.trim().length < 2) return;
    setSaving(true);
    try {
      const res = await fetcher({
        url,
        method: "PUT",
        payload: {
          complaint: draft.complaint.trim(),
          onset: draft.onset,
          severity: draft.severity,
          conditions: draft.conditions,
          medications: draft.medications.trim() || undefined,
          allergies: draft.allergies.trim() || undefined,
          redFlags: draft.redFlags,
          notes: draft.notes.trim() || undefined,
        },
      });
      await mutate(res.data, { revalidate: false });
      setEditing(false);
      notify(getContent("visitSaved"), "Success");
    } catch (err) {
      notify((err as Error).message, "Error");
    } finally {
      setSaving(false);
    }
  };

  const header = (
    <div className={classes.cardHead}>
      <span className={classes.headIcon}>
        <Ixon width="1.1rem">
          <SparkIcon />
        </Ixon>
      </span>
      <div className={classes.headText}>
        <h2 className={classes.cardTitle}>{getContent("visitIntakeTitle")}</h2>
        <span className={classes.muted}>{getContent("visitPrivacy")}</span>
      </div>
    </div>
  );

  // ---- submitted: read-only answers ----
  if (intake && !editing) {
    return (
      <section className={classes.card}>
        {header}
        <IntakeAnswers intake={intake} ns={NS} />
        {editable ? (
          <button type="button" className={classes.ghostBtn} onClick={() => setEditing(true)}>
            {getContent("visitEdit")}
          </button>
        ) : (
          <span className={classes.muted}>{getContent("visitLocked")}</span>
        )}
      </section>
    );
  }

  // ---- not started: invitation ----
  if (!intake && !editing) {
    return (
      <section className={`${classes.card} ${classes.invite}`}>
        {header}
        <p className={classes.lead}>{getContent("visitInvite")}</p>
        <button type="button" className={classes.primaryBtn} onClick={() => setEditing(true)}>
          {getContent("visitStart")}
        </button>
      </section>
    );
  }

  // ---- form ----
  return (
    <form className={classes.card} onSubmit={submit}>
      {header}

      <label className={classes.field}>
        <span className={classes.label}>
          {getContent("visitComplaint")} <span className={classes.req}>*</span>
        </span>
        <textarea
          required
          minLength={2}
          maxLength={1000}
          rows={3}
          value={draft.complaint}
          placeholder={getContent("visitComplaintPlaceholder")}
          onChange={(e) => set("complaint", e.target.value)}
        />
      </label>

      <fieldset className={classes.field}>
        <legend className={classes.label}>{getContent("visitOnset")}</legend>
        <div className={classes.chips}>
          {intakeOnsets.map((o) => (
            <button
              key={o}
              type="button"
              aria-pressed={draft.onset === o}
              className={`${classes.chip} ${draft.onset === o ? classes.chipOn : ""}`}
              onClick={() => set("onset", draft.onset === o ? undefined : o)}
            >
              {getContent(onsetKeys[o])}
            </button>
          ))}
        </div>
      </fieldset>

      <label className={classes.field}>
        <span className={classes.label}>
          {getContent("visitSeverity")}
          <strong className={classes.severityValue}>{num.format(draft.severity)}</strong>
        </span>
        <input
          type="range"
          min={0}
          max={10}
          step={1}
          value={draft.severity}
          onChange={(e) => set("severity", Number(e.target.value))}
          className={classes.range}
        />
      </label>

      <fieldset className={classes.field}>
        <legend className={classes.label}>{getContent("visitConditions")}</legend>
        <div className={classes.chips}>
          {intakeConditions.map((c) => (
            <button
              key={c}
              type="button"
              aria-pressed={draft.conditions.includes(c)}
              className={`${classes.chip} ${draft.conditions.includes(c) ? classes.chipOn : ""}`}
              onClick={() => set("conditions", toggle(draft.conditions, c))}
            >
              {getContent(conditionKeys[c])}
            </button>
          ))}
        </div>
      </fieldset>

      <div className={classes.twoCols}>
        <label className={classes.field}>
          <span className={classes.label}>{getContent("visitMedications")}</span>
          <textarea rows={2} maxLength={1000} value={draft.medications} onChange={(e) => set("medications", e.target.value)} />
        </label>
        <label className={classes.field}>
          <span className={classes.label}>{getContent("visitAllergies")}</span>
          <textarea rows={2} maxLength={500} value={draft.allergies} onChange={(e) => set("allergies", e.target.value)} />
        </label>
      </div>

      <fieldset className={classes.field}>
        <legend className={classes.label}>{getContent("visitRedFlagsQuestion")}</legend>
        <div className={classes.chips}>
          {intakeRedFlags.map((f) => (
            <button
              key={f}
              type="button"
              aria-pressed={draft.redFlags.includes(f)}
              className={`${classes.chip} ${draft.redFlags.includes(f) ? classes.chipWarn : ""}`}
              onClick={() => set("redFlags", toggle(draft.redFlags, f))}
            >
              {getContent(redFlagKeys[f])}
            </button>
          ))}
        </div>
      </fieldset>

      {draft.redFlags.length > 0 && (
        <div className={classes.urgent} role="alert">
          <strong>{getContent("visitUrgentTitle")}</strong>
          <span>{getContent("visitUrgentBody", [emergencyNumberText])}</span>
        </div>
      )}

      <label className={classes.field}>
        <span className={classes.label}>{getContent("visitNotes")}</span>
        <textarea rows={2} maxLength={1000} value={draft.notes} onChange={(e) => set("notes", e.target.value)} />
      </label>

      <div className={classes.formActions}>
        <button type="submit" className={classes.primaryBtn} disabled={saving || draft.complaint.trim().length < 2}>
          {getContent("visitSubmit")}
        </button>
        {(intake || editing) && (
          <button
            type="button"
            className={classes.ghostBtn}
            onClick={() => {
              setDraft(toDraft(intake));
              setEditing(false);
            }}
          >
            {getContent("cancel")}
          </button>
        )}
      </div>
    </form>
  );
};

export default PatientIntakeCard;
