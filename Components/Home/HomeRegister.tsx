import { ReactNode } from "react";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import classes from "./HomeRegister.module.css";
import Ixon from "../UI/Ixon";
import ArrowLeftIcon from "../Icons/ArrowLeftIcon";
import StetoscopeIcon from "../Icons/StetoscopeIcon";
import MedicalRecordIcon from "../Icons/MedicalRecordIcon";
import NotifyIcon from "../Icons/NotifyIcon";
import WalletIcon from "../Icons/WalletIcon";
import RocketIcon from "../Icons/RocketIcon";
import { ContentKey } from "../Enums/contentKeys";
import Button from "../UI/Button";
import { SiteStats, useStatFormat } from "../helpers/siteStats";

const NS: ContentNamespace[] = ["common", "home"];

// real counts from the site (getHome's stats)
const statTiles: { title: ContentKey; key: keyof SiteStats }[] = [
  { title: "doctors", key: "doctors" },
  { title: "pharmacies", key: "pharmacies" },
  { title: "labs", key: "labs" },
  { title: "patients", key: "patients" },
];

// A count is shown only once it says something ("1 doctors" read as a
// joke); until at least two of them do, the band lists what a provider
// gets instead (the benchmark's reasons doctors pick a panel: e-Rx for
// Tamin/Salamat, SMS reminders against no-shows, domestic payments, a free
// start with no exclusivity).
const MIN_STAT = 50;

const props: { title: ContentKey; icon: ReactNode }[] = [
  { title: "joinPropRx", icon: <MedicalRecordIcon /> },
  { title: "joinPropSms", icon: <NotifyIcon /> },
  { title: "joinPropPay", icon: <WalletIcon /> },
  { title: "joinPropFree", icon: <RocketIcon /> },
];

const HomeRegister = ({ stats }: { stats?: SiteStats }) => {
  const getContent = useScopedLocale(NS);
  const format = useStatFormat();
  const shown = statTiles.filter((el) => Number(stats?.[el.key]) >= MIN_STAT);
  const showStats = shown.length >= 2;

  return (
    <section className={classes.main}>
      <div className={classes.decor} aria-hidden="true" />
      <div className={classes.content}>
        <span className={classes.eyebrow}>
          <Ixon width="0.875rem">
            <StetoscopeIcon />
          </Ixon>
          {getContent("doctorsAndMedicalCenters")}
        </span>
        <h2 className={classes.title}>{getContent("homeJoinNoyanTitle")}</h2>
        <p className={classes.description}>
          {getContent("homeJoinNoyanDescription")}
        </p>
        <div className={classes.actions}>
          <Button
            href={"/become/doctor"}
            mode="Light"
            radius="High"
            size="L"
            tailIcon={
              <span style={{ display: "flex" }}>
                <ArrowLeftIcon />
              </span>
            }
          >
            {getContent("registerDoctors")}
          </Button>
          <Button href={"/become"} mode="Glass" size="L" radius="High">
            {getContent("registerPharmacyAndLab")}
          </Button>
        </div>
      </div>
      {showStats ? (
        <ul className={classes.stats}>
          {shown.map(({ title, key }) => (
            <li key={title} className={classes.stat}>
              <span className={classes.statValue}>
                {format.count(stats?.[key] as number)}
              </span>
              <span className={classes.statTitle}>{getContent(title)}</span>
            </li>
          ))}
        </ul>
      ) : (
        <ul className={classes.stats}>
          {props.map(({ title, icon }) => (
            <li key={title} className={`${classes.stat} ${classes.prop}`}>
              <span className={`${classes.propIcon} glassIcon glassOnBand`}>
                <Ixon width="1.25rem">{icon}</Ixon>
              </span>
              <span className={classes.propTitle}>{getContent(title)}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default HomeRegister;
