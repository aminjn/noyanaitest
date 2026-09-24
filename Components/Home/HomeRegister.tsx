import Link from "next/link";
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

const NS: ContentNamespace[] = ["common", "home"];

// const stats: ContentKey[] = [
//   "statPharmacyCount",
//   "statDoctorCount",
//   "statLabCount",
//   "statPatientCount",
// ];

const stats: { title: ContentKey; value: ContentKey }[] = [
  { title: "doctors", value: "doctorCountValue" },
  { title: "pharmacies", value: "pharmacyCountValue" },
  { title: "labs", value: "labsCountValue" },
  { title: "patients", value: "patientsCountValue" },
];

// Redesigned "join Noyan" CTA (Figma, Aug 2026): a gradient stats banner
// instead of the previous split content/avatar-stack card. Replaces the
// former "cunts" avatar row and register.png illustration entirely.
const HomeRegister = () => {
  const getContent = useScopedLocale(NS);

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
      <div className={classes.stats}>
        {stats.map(({ title, value }) => (
          <div key={title} className={`${classes.stat} ${tsmMedium}`}>
            <span className={`${classes.statValue} ${txlBold}`}>
              {getContent(value)}
            </span>
            <span className={`${classes.statTitle} ${tsmRegular}`}>
              {getContent(title)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomeRegister;
