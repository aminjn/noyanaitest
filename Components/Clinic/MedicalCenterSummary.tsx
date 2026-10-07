import { ReactNode } from "react";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import { t2xsRegular, tsmBold, tsmRegular } from "../UI/Typography";
import classes from "./MedicalCenterSummary.module.css";
import Ixon from "../UI/Ixon";
import HashtagIcon from "../Icons/HashtagIcon";
import StetoscopeIcon from "../Icons/StetoscopeIcon";
import PeopleIcon from "../Icons/PeopleIcon";
import BuildingIcon from "../Icons/BuildingIcon";
import HospitalIcon from "../Icons/HospitalIcon";
import ClockIcon from "../Icons/ClockIcon";
import { useIntlLocale } from "../i18n/navigation";

const NS: ContentNamespace[] = ["common", "medicalCenter"];

const InfoIcon = ({
  tone,
  children,
}: {
  children: ReactNode;
  tone: "indigo" | "teal" | "violet";
}) => {
  return (
    <div className={`${classes.icon} glassIcon tone-${tone}`}>
      <Ixon width="1rem">{children}</Ixon>
    </div>
  );
};

const Info = ({
  icon,
  title,
  value,
}: {
  title: string;
  value: string;
  icon: ReactNode;
}) => {
  return (
    <div className={classes.info}>
      {icon}
      <div className={classes.infoContent}>
        <legend className={`${classes.infoTitle} ${t2xsRegular}`}>
          {title}
        </legend>
        <span className={`${classes.infoValue} ${tsmBold}`}>{value}</span>
      </div>
    </div>
  );
};

const MedicalCenterSummary = ({
  summary,
  description,
  code,
  doctorCount,
  personelCount,
  establishment,
  bedCount,
  emergency,
  roundTheClock,
}: {
  summary?: string;
  // the full introduction, shown whole under the summary
  description?: string;
  code?: string;
  doctorCount?: number;
  personelCount?: number;
  establishment?: string;
  // a hospital's beds and 24-hour emergency department
  bedCount?: number;
  emergency?: boolean;
  // a clinic open around the clock
  roundTheClock?: boolean;
}) => {
  const getContent = useScopedLocale(NS);
  const locale = useIntlLocale();

  return (
    <div className={classes.main} id="introduction">
      {!!summary && (
        <p className={`${classes.summary} ${tsmRegular}`}>{summary}</p>
      )}
      {!!description?.trim() && description.trim() !== summary?.trim() && (
        <p className={`${classes.description} ${tsmRegular}`}>{description}</p>
      )}
      <div className={classes.infos}>
        {!!code && (
          <Info
            icon={
              <InfoIcon tone="indigo">
                <HashtagIcon />
              </InfoIcon>
            }
            title={getContent("clinicCode")}
            value={code}
          />
        )}
        {!!doctorCount && (
          <Info
            icon={
              <InfoIcon tone="indigo">
                <StetoscopeIcon />
              </InfoIcon>
            }
            title={getContent("doctors")}
            value={doctorCount.toLocaleString(locale)}
          />
        )}
        {!!personelCount && (
          <Info
            icon={
              <InfoIcon tone="teal">
                <PeopleIcon />
              </InfoIcon>
            }
            title={getContent("personel")}
            value={getContent("nPerson", [personelCount.toString()])}
          />
        )}
        {!!emergency && (
          <Info
            icon={
              <InfoIcon tone="violet">
                <ClockIcon />
              </InfoIcon>
            }
            title={getContent("mcEmergency")}
            value={getContent("roundTheClock")}
          />
        )}
        {!emergency && !!roundTheClock && (
          <Info
            icon={
              <InfoIcon tone="violet">
                <ClockIcon />
              </InfoIcon>
            }
            title={getContent("businessTime")}
            value={getContent("roundTheClock")}
          />
        )}
        {typeof bedCount === "number" && bedCount > 0 && (
          <Info
            icon={
              <InfoIcon tone="teal">
                <HospitalIcon />
              </InfoIcon>
            }
            title={getContent("mcBeds")}
            value={bedCount.toLocaleString(locale)}
          />
        )}
        {!!establishment && (
          <Info
            icon={
              <InfoIcon tone="violet">
                <BuildingIcon />
              </InfoIcon>
            }
            title={getContent("establishment")}
            value={establishment}
          />
        )}
      </div>
    </div>
  );
};

export default MedicalCenterSummary;
