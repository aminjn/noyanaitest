"use client";

import classes from "./LicensePromotionBanner.module.css";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import { ContentKey } from "@/Components/Enums/contentKeys";
import { useIntlLocale } from "@/Components/i18n/navigation";
import { currencize } from "@/Components/helpers/currencize";
import { ILicensePromotionInfo } from "./useLicenseQuotes";
import LicensePromotionCountdown from "./LicensePromotionCountdown";

const LOCALE_NS: ContentNamespace[] = ["common", "sharedLicense"];

// The running plan promotions (launch discount, 2026-10) above a plan
// lineup: title, how much off, "first purchase only" and the countdown to
// its end. Nothing when no promotion runs.
const LicensePromotionBanner = ({
  promotions,
  className = "",
}: {
  promotions?: ILicensePromotionInfo[] | null;
  className?: string;
}) => {
  const getContent = useScopedLocale(LOCALE_NS);
  const intlTag = useIntlLocale();
  const list = (Array.isArray(promotions) ? promotions : []).filter(
    (p) => p && p.endsAt && new Date(p.endsAt).getTime() > Date.now(),
  );
  if (!list.length) return null;
  return (
    <div className={`${classes.list} ${className}`}>
      {list.map((p) => (
        <div key={p._id} className={classes.main}>
          <div className={classes.text}>
            <strong className={classes.title}>
              {p.title || getContent("specialDiscount")}
            </strong>
            <span className={classes.off}>
              {p.discountType === "amount"
                ? getContent("licensePromoAmountOff" as ContentKey, [currencize(p.value)])
                : getContent("licensePromoPercentOff" as ContentKey, [
                    new Intl.NumberFormat(intlTag).format(Number(p.value) || 0),
                  ])}
              {p.firstPurchaseOnly && ` · ${getContent("licensePromoFirstPurchase" as ContentKey)}`}
            </span>
          </div>
          <LicensePromotionCountdown endsAt={p.endsAt} className={classes.timer} />
        </div>
      ))}
    </div>
  );
};

export default LicensePromotionBanner;
