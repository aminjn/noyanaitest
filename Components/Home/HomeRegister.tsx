import Link from "next/link";
import useLocale from "../Hooks/useLocale";
import classes from "./HomeRegister.module.css";
import Ixon from "../UI/Ixon";
import ArrowLeftIcon from "../Icons/ArrowLeftIcon";
import { t3xlDemiBold, tmdMedium, tsmMedium } from "../UI/Typography";
import { ContentKey } from "../Enums/contentKeys";

const stats: ContentKey[] = [
  "statPharmacyCount",
  "statDoctorCount",
  "statLabCount",
  "statPatientCount",
];

// Redesigned "join Noyan" CTA (Figma, Aug 2026): a gradient stats banner
// instead of the previous split content/avatar-stack card. Replaces the
// former "cunts" avatar row and register.png illustration entirely.
const HomeRegister = () => {
  const getContent = useLocale();

  return (
    <div className={classes.main}>
      <div className={classes.stats}>
        {stats.map((key) => (
          <div key={key} className={`${classes.stat} ${tsmMedium}`}>
            {getContent(key)}
          </div>
        ))}
      </div>
      <div className={classes.content}>
        <h3 className={`${classes.title} ${t3xlDemiBold}`}>
          {getContent("homeJoinNoyanTitle")}
        </h3>
        <p className={`${classes.description} ${tmdMedium}`}>
          {getContent("homeJoinNoyanDescription")}
        </p>
        <div className={classes.actions}>
          <Link href={"/become"} className={`${classes.action} ${tmdMedium}`}>
            {getContent("registerDoctors")}
          </Link>
          <Link
            href={"/become"}
            className={`${classes.action} ${classes.actionOutline} ${tmdMedium}`}
          >
            {getContent("registerPharmacyAndLab")}
            <Ixon width="1.5rem">
              <ArrowLeftIcon />
            </Ixon>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomeRegister;
