import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import LocationIcon from "../Icons/LocationIcon";
import IconTitle from "../UI/IconTitle";
import { tsmRegular, txsDemiBold, txsRegular } from "../UI/Typography";
import classes from "./MedicalCenterContactInfo.module.css";

const NS: ContentNamespace[] = ["common", "medicalCenter"];

type ContactFields = {
  address?: string;
  phone?: string;
  website?: string;
  mail?: string;
  businessTimes?: string;
};
// a centre with nothing to show gets no empty box (nor a nav chip for it)
export const hasContactInfo = (n: ContactFields & { owner?: unknown }) =>
  [n.address, n.phone, n.website, n.mail, n.businessTimes].some(
    (v) => typeof v === "string" && !!v.trim(),
  ) || !!n.owner;
const MedicalCenterContactInfo = ({
  address,
  businessTimes,
  mail,
  owner,
  phone,
  website,
}: {
  address?: string;
  phone?: string;
  website?: string;
  mail?: string;
  businessTimes?: string;
  owner?: string;
}) => {
  const getContent = useScopedLocale(NS);

  if (!hasContactInfo({ address, phone, website, mail, businessTimes, owner })) return null;
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
        {!!businessTimes?.trim() && (
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
