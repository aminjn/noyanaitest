import Link from "@/Components/i18n/Link";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import classes from "./HomeRegister.module.css";
import Ixon from "../UI/Ixon";
import ArrowLeftIcon from "../Icons/ArrowLeftIcon";
import {
  t3xlDemiBold,
  tmdMedium,
  tsmMedium,
  tsmRegular,
  txlBold,
} from "../UI/Typography";
import { ContentKey } from "../Enums/contentKeys";
import Button from "../UI/Button";
import { SiteStats, useStatFormat } from "../helpers/siteStats";

const NS: ContentNamespace[] = ["common", "home"];

// const stats: ContentKey[] = [
//   "statPharmacyCount",
//   "statDoctorCount",
//   "statLabCount",
//   "statPatientCount",
// ];

// real counts from the site (getHome's stats); a zero is left out rather
// than shown as a boast
const statTiles: { title: ContentKey; key: keyof SiteStats }[] = [
  { title: "doctors", key: "doctors" },
  { title: "pharmacies", key: "pharmacies" },
  { title: "labs", key: "labs" },
  { title: "patients", key: "patients" },
];

// Redesigned "join Noyan" CTA (Figma, Aug 2026): a gradient stats banner
// instead of the previous split content/avatar-stack card. Replaces the
// former "cunts" avatar row and register.png illustration entirely.
const HomeRegister = ({ stats }: { stats?: SiteStats }) => {
  const getContent = useScopedLocale(NS);
  const format = useStatFormat();
  const shown = statTiles.filter((el) => Number(stats?.[el.key]) > 0);

  return (
    <div className={classes.main}>
      <div className={classes.content}>
        <h3 className={`${classes.title} ${t3xlDemiBold}`}>
          {getContent("homeJoinNoyanTitle")}
        </h3>
        <p className={`${classes.description} ${tmdMedium}`}>
          {getContent("homeJoinNoyanDescription")}
        </p>
        <div className={classes.actions}>
          <Button
            href={"/become"}
            variant="Primary"
            mode="Outline"
            radius="High"
            size="M"
          >
            {getContent("registerDoctors")}
          </Button>
          <Button
            href={"/become"}
            variant="Primary"
            mode="Outline"
            size="M"
            radius="High"
            className={classes.secondary}
          >
            {getContent("registerPharmacyAndLab")}
          </Button>
        </div>
      </div>
      {!!shown.length && (
        <div className={classes.stats}>
          {shown.map(({ title, key }) => (
            <div key={title} className={`${classes.stat} ${tsmMedium}`}>
              <span className={`${classes.statValue} ${txlBold}`}>
                {format.count(stats?.[key] as number)}
              </span>
              <span className={`${classes.statTitle} ${tsmRegular}`}>
                {getContent(title)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HomeRegister;
