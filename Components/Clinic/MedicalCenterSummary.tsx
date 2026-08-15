import { ReactNode } from "react";
import useLocale from "../Hooks/useLocale";
import { t2xsRegular, tsmBold, tsmRegular } from "../UI/Typography";
import classes from "./MedicalCenterSummary.module.css";
import Ixon from "../UI/Ixon";
import HashtagIcon from "../Icons/HashtagIcon";
import StetoscopeIcon from "../Icons/StetoscopeIcon";
import PeopleIcon from "../Icons/PeopleIcon";
import BuildingIcon from "../Icons/BuildingIcon";

const InfoIcon = ({
  bacCol,
  children,
  color,
}: {
  children: ReactNode;
  color: string;
  bacCol: string;
}) => {
  return (
    <div className={classes.icon} style={{ color, backgroundColor: bacCol }}>
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
  code,
  doctorCount,
  personelCount,
  establishment,
}: {
  summary?: string;
  code?: string;
  doctorCount?: number;
  personelCount?: number;
  establishment?: string;
}) => {
  const getContent = useLocale();

  return (
    <div className={classes.main} id="introduction">
      {!!summary && (
        <p className={`${classes.summary} ${tsmRegular}`}>{summary}</p>
      )}
      <div className={classes.infos}>
        {!!code && (
          <Info
            icon={
              <InfoIcon color="var(--primary)" bacCol="var(--primary1)">
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
              <InfoIcon color="var(--primary)" bacCol="var(--primary1)">
                <StetoscopeIcon />
              </InfoIcon>
            }
            title={getContent("doctors")}
            value={doctorCount.toString()}
          />
        )}
        {!!personelCount && (
          <Info
            icon={
              <InfoIcon color="var(--successS1)" bacCol="var(--successT1)">
                <PeopleIcon />
              </InfoIcon>
            }
            title={getContent("personel")}
            value={getContent("nPerson", [personelCount.toString()])}
          />
        )}
        {!!establishment && (
          <Info
            icon={
              <InfoIcon color="var(--secondary)" bacCol="vvar(--secondary1)">
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
