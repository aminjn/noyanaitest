"use client";
import Button from "../UI/Button";
import Ixon from "../UI/Ixon";
import AiIcon from "../Icons/AiIcon";
import StetoscopeIcon from "../Icons/StetoscopeIcon";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentKey } from "../Enums/contentKeys";
import { tsmDemiBold, txsRegular } from "../UI/Typography";
import classes from "./DirectoryFunnel.module.css";

// The directory's way on (2026-10, owner's decision): every disease, symptom
// and directory page sends the reader either into the AI symptom check
// («تشخیص هوشمند», /wizard, the question prefilled) or to a specialist on
// the booking search (/book, the speciality preselected) - the way Mayo
// Clinic ends a condition page on "Request an appointment" and Ada / K
// Health on "check your symptoms". The AI is a door to a doctor, never a
// diagnosis.
export const aiCheckHref = (prompt?: string) =>
  prompt ? `/wizard?q=${encodeURIComponent(prompt)}` : "/wizard";

export const bookSpecialistHref = (
  speciality?: { _id: string; name?: string } | null,
  disease?: { _id: string; name?: string } | null,
) =>
  speciality?._id
    ? `/book?speciality=${speciality._id}&name=${encodeURIComponent(speciality.name || "")}`
    : disease?._id
      ? `/book?disease=${disease._id}&name=${encodeURIComponent(disease.name || "")}`
      : "/book";

const DirectoryFunnel = ({
  aiPrompt,
  speciality,
  disease,
  doctorTitle,
  compact,
}: {
  aiPrompt?: string;
  speciality?: { _id: string; name?: string } | null;
  disease?: { _id: string; name?: string } | null;
  // e.g. «مشورت با پزشک» on a drug page
  doctorTitle?: string;
  compact?: boolean;
}) => {
  const getContent = useScopedLocale();
  const doctorLabel =
    doctorTitle ||
    (speciality?.name
      ? getContent("bookSpecialistOf", [speciality.name])
      : getContent("bookASpecialist"));
  return (
    <section className={`${classes.main} ${compact ? classes.compact : ""}`}>
      <div className={classes.text}>
        <span className={`${classes.icon} glassIcon tone-violet`}>
          <Ixon width="1.375rem">
            <AiIcon />
          </Ixon>
        </span>
        <div>
          <h2 className={`${classes.title} ${tsmDemiBold}`}>
            {getContent("directoryFunnelTitle")}
          </h2>
          <p className={`${classes.note} ${txsRegular}`}>
            {getContent("directoryFunnelText")}
          </p>
        </div>
      </div>
      <div className={classes.actions}>
        <Button
          variant="Primary"
          mode="Fill"
          size="M"
          radius="High"
          href={aiCheckHref(aiPrompt)}
          leadIcon={<AiIcon />}
          className={classes.action}
        >
          {getContent("inspectSymptomWithAi")}
        </Button>
        <Button
          variant="Primary"
          mode="Outline"
          size="M"
          radius="High"
          href={bookSpecialistHref(speciality, disease)}
          leadIcon={<StetoscopeIcon />}
          className={classes.action}
        >
          {doctorLabel}
        </Button>
      </div>
    </section>
  );
};

export default DirectoryFunnel;
