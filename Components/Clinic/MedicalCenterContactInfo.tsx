import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import LocationIcon from "../Icons/LocationIcon";
import IconTitle from "../UI/IconTitle";
import { tsmRegular, txsDemiBold, txsRegular } from "../UI/Typography";
import classes from "./MedicalCenterContactInfo.module.css";
import OpeningHoursTable from "../OpeningHours/OpeningHoursTable";
import { exceptionsOf, OpeningHours, OpenStatus, weekOf } from "../OpeningHours/openingHours";

const NS: ContentNamespace[] = ["common", "medicalCenter"];

type ContactFields = {
  address?: string;
  phone?: string;
  website?: string;
  mail?: string;
  businessTimes?: string;
  openingHours?: OpeningHours | null;
};
// a structured week (2026-10) shows as the table, its free text as the note
const hasWeek = (h?: OpeningHours | null) => !!weekOf(h) || !!exceptionsOf(h).length;
// a centre with nothing to show gets no empty box (nor a nav chip for it)
export const hasContactInfo = (n: ContactFields & { owner?: unknown }) =>
  [n.address, n.phone, n.website, n.mail, n.businessTimes].some(
    (v) => typeof v === "string" && !!v.trim(),
  ) || !!n.owner || hasWeek(n.openingHours);
const MedicalCenterContactInfo = ({
  address,
  businessTimes,
  mail,
  owner,
  phone,
  website,
  openingHours,
  openStatus,
}: {
  address?: string;
  phone?: string;
  website?: string;
  mail?: string;
  businessTimes?: string;
  owner?: string;
  openingHours?: OpeningHours | null;
  openStatus?: OpenStatus | null;
}) => {
  const getContent = useScopedLocale(NS);

  if (!hasContactInfo({ address, phone, website, mail, businessTimes, owner, openingHours })) return null;
  return (
    <div className={classes.main} id="contact">
      <IconTitle icon={<LocationIcon />}>{getContent("contactInfo")}</IconTitle>
      <div className={classes.content}>
        {!!address && (
          <p className={`${classes.black} ${tsmRegular}`}>{address}</p>
        )}
        {/* the phone dials, the site and mail open (a patient calls to ask) */}
        {!!phone?.trim() && (
          <p className={`${classes.black} ${tsmRegular}`}>
            <a href={`tel:${phone.replace(/[^\d+]/g, "")}`} dir="ltr">
              {phone}
            </a>
          </p>
        )}
        {!!website?.trim() && (
          <p className={`${classes.black} ${tsmRegular}`}>
            <a
              href={/^https?:\/\//i.test(website.trim()) ? website.trim() : `https://${website.trim()}`}
              target="_blank"
              rel="noopener noreferrer nofollow"
              dir="ltr"
            >
              {website}
            </a>
          </p>
        )}
        {!!mail?.trim() && (
          <p className={`${classes.black} ${tsmRegular}`}>
            <a href={`mailto:${mail.trim()}`} dir="ltr">
              {mail}
            </a>
          </p>
        )}
        {hasWeek(openingHours) && (
          <OpeningHoursTable hours={openingHours} status={openStatus} note={businessTimes} />
        )}
        {!hasWeek(openingHours) && !!businessTimes?.trim() && (
          <p className={`${classes.gray} ${txsRegular}`}>
            {`${getContent("businessTime")}: ${businessTimes}`}
          </p>
        )}
        {owner && (
          <p>
            <span className={classes.gray}>{getContent("management")}</span>
            &nbsp;
            <span className={`${classes.black} ${txsDemiBold}`}>{owner}</span>
          </p>
        )}
      </div>
    </div>
  );
};

export default MedicalCenterContactInfo;
