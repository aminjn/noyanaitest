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
import { ContentKey } from "@/Components/Enums/contentKeys";
import { ILicenseQuote } from "./useLicenseQuotes";

const LOCALE_NS: ContentNamespace[] = ["common", "sharedLicense"];

const LicenseCard = ({
  duration,
  license,
  org,
  quote,
  href,
  actionLabel,
}: {
  org: LicenseOrg;
  license: IBaseLicense;
  duration: ILicenseDuration | null;
  // the server's price of the shown option (useLicenseQuotes): the
  // option's own discount plus a running promotion
  quote?: ILicenseQuote | null;
  // where the action goes (the public pricing page sends a visitor to
  // sign up instead of the panel); and its label
  href?: string;
  actionLabel?: string;
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
    (quote?.promotionDiscount || 0) > 0 ||
    (!pricing &&
      (Array.isArray(license.pricing) ? license.pricing : []).some(
        (el) => el.isActive !== false && (el.discount || 0) > 0,
      ));
  // nothing to buy: the free default tier ("free forever")
  const hasPrice = (Array.isArray(license.pricing) ? license.pricing : []).some(
    (el) => el.isActive !== false,
  );
  const free = !hasPrice && !!license.isDefault;
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
        {/* the middle tier: "best seller" (2026-10 plan lineup) */}
        {license.isRecommended && (
          <Badge size="L" mode="Fill" radius="High" color="Primarylight">
            {getContent("licenseBestSeller" as ContentKey)}
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
      <LicensePriceDetails
        duration={duration}
        pricing={pricing}
        quote={quote}
        free={free}
      />
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
      {/* in a panel the free tier is what the provider already runs on:
          nothing to choose */}
      {(!free || !!href) && (
      <Button
        className={classes.action}
        href={href || `${licensePanelRootByOrg[org]}/license/${license._id}`}
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
        {actionLabel || getContent("chooseLicense")}
      </Button>
      )}
    </div>
  );
};

export default LicenseCard;
