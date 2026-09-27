"use client";

import { useMemo } from "react";
import classes from "./Visit.module.css";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import { useIntlLocale } from "../i18n/navigation";
import {
  IVisitIntake,
  conditionKeys,
  intakeConditions,
  intakeOnsets,
  intakeRedFlags,
  known,
  onsetKeys,
  redFlagKeys,
} from "./visitTypes";

// Read-only view of a submitted questionnaire (patient and doctor).
const IntakeAnswers = ({ intake, ns }: { intake: IVisitIntake; ns: ContentNamespace[] }) => {
  const getContent = useScopedLocale(ns);
  const intlTag = useIntlLocale();
  const num = useMemo(() => new Intl.NumberFormat(intlTag), [intlTag]);
  const onset = known(intakeOnsets, [intake.onset])[0];
  const conditions = known(intakeConditions, intake.conditions);
  const flags = known(intakeRedFlags, intake.redFlags);
  const none = getContent("visitNone");

  const rows: [string, string][] = [
    [getContent("visitComplaint"), intake.complaint || none],
    [getContent("visitOnset"), onset ? getContent(onsetKeys[onset]) : none],
    [
      getContent("visitSeverity"),
      typeof intake.severity === "number" ? `${num.format(intake.severity)} / ${num.format(10)}` : none,
    ],
    [getContent("visitConditions"), conditions.length ? conditions.map((c) => getContent(conditionKeys[c])).join(" · ") : none],
    [getContent("visitMedications"), intake.medications || none],
    [getContent("visitAllergies"), intake.allergies || none],
  ];
  if (intake.notes) rows.push([getContent("visitNotes"), intake.notes]);

  return (
    <div className={classes.answers}>
      {flags.length > 0 && (
        <div className={classes.flagBox} role="note">
          <strong>{getContent("visitRedFlags")}</strong>
          <span>{flags.map((f) => getContent(redFlagKeys[f])).join(" · ")}</span>
        </div>
      )}
      <dl className={classes.answerList}>
        {rows.map(([label, value]) => (
          <div key={label} className={classes.answerRow}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
};

export default IntakeAnswers;
