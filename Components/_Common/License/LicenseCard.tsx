import Badge from "@/Components/UI/Badge";
import classes from "./LicenseCard.module.css";
import {
  IBaseLicense,
  IBaseLicensePricing,
  ILicenseDuration,
  LicenseOrg,
  licensePanelRootByOrg,
} from "./licenseTypes";
import Ixon from "@/Components/UI/Ixon";
import CrownIcon from "@/Components/Icons/CrownIcon";
import { useMemo } from "react";
import Button from "@/Components/UI/Button";
import ChevronIcon from "@/Components/Icons/ChevronIcon";
import CheckIcon from "@/Components/Icons/CheckIcon";
import { tsmBold } from "@/Components/UI/Typography";
import LicensePriceDetails from "./LicensePriceDetails";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const LOCALE_NS: ContentNamespace[] = ["common", "sharedLicense"];

const LicenseCard = ({
  duration,
  license,
  org,
}: {
  org: LicenseOrg;
  license: IBaseLicense;
  duration: ILicenseDuration | null;
}) => {
  const getContent = useScopedLocale(LOCALE_NS);

  const pricing = useMemo<IBaseLicensePricing | null>(
    () =>
      (Array.isArray(license.pricing) ? license.pricing : []).find(
        (el) => el.duration === duration?._id,
      ) || null,
    [license, duration],
  );
  // the badge follows the real discount (the shown period's, else any
  // period on sale), never a hand-set flag
  const discounted =
    (pricing?.discount || 0) > 0 ||
    (!pricing &&
      (Array.isArray(license.pricing) ? license.pricing : []).some(
        (el) => el.isActive !== false && (el.discount || 0) > 0,
      ));
  const features = Array.isArray(license.descriptions)
    ? license.descriptions.filter(Boolean)
    : [];

  return (
    <div
      className={`${classes.main} ${license.isGolden ? classes.alt : ""} ${
        license.isRecommended ? classes.recommended : ""
      }`}
    >
      <div className={classes.badges}>
        {discounted && (
          <Badge color="Error" radius="High" mode="Fill" size="L">
            {getContent("specialDiscount")}
          </Badge>
        )}
        {license.isRecommended && (
          <Badge size="L" mode="Fill" radius="High" color="Primarylight">
            {getContent("specialOffer")}
          </Badge>
        )}
      </div>
      <div className={classes.nameBox}>
        <Ixon width="1.5rem" className={`${classes.icon}`}>
          <CrownIcon />
        </Ixon>
        <span className={`${classes.name} ${tsmBold}`}>
          {license.displayName}
        </span>
      </div>
      <LicensePriceDetails duration={duration} pricing={pricing} />
      {!!license.summary && (
        <p className={classes.summary}>{license.summary}</p>
      )}
      <ul className={classes.features}>
        {features.map((el, i) => (
          <li key={`${i}-${el}`} className={classes.feature}>
            <Ixon width="0.875rem" className={classes.check}>
              <CheckIcon />
            </Ixon>
            {el}
          </li>
        ))}
      </ul>
      <Button
        className={classes.action}
        href={`${licensePanelRootByOrg[org]}/license/${license._id}`}
        tailIcon={
          <Ixon style={{ transform: "rotateZ(90deg)" }}>
            <ChevronIcon />
          </Ixon>
        }
        size="M"
        mode="Fill"
        radius="Medium"
        variant="Primary"
      >
        {getContent("chooseLicense")}
      </Button>
    </div>
  );
};

export default LicenseCard;
