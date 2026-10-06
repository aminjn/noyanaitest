"use client";

import { ReactNode, useMemo } from "react";
import classes from "./Pro.module.css";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentKey } from "@/Components/Enums/contentKeys";
import { useIntlLocale } from "@/Components/i18n/navigation";
import { currencize } from "@/Components/helpers/currencize";
import Ixon from "@/Components/UI/Ixon";
import SparkIcon from "@/Components/Icons/SparkIcon";
import StetoscopeIcon from "@/Components/Icons/StetoscopeIcon";
import TruckIcon from "@/Components/Icons/TruckIcon";
import ClockIcon from "@/Components/Icons/ClockIcon";
import HeadphoneIcon from "@/Components/Icons/HeadphoneIcon";
import UserCheckIcon from "@/Components/Icons/UserCheckIcon";
import { IProBenefits } from "./useProData";

const k = (key: string) => key as ContentKey;

type Benefit = { key: string; icon: ReactNode; title: string; note?: string };

// The «پرو» benefits the super admin switched on, each with the figure the
// server enforces (Lib/patientPro.ts) - built from the config, so the page
// never promises what is off.
export const useProBenefits = (b: IProBenefits | null | undefined): Benefit[] => {
  const getContent = useScopedLocale();
  const intlTag = useIntlLocale();
  return useMemo(() => {
    if (!b) return [];
    const n = new Intl.NumberFormat(intlTag);
    const out: Benefit[] = [];
    if (b.aiEnabled)
      out.push({
        key: "ai",
        icon: <SparkIcon />,
        title: b.proAiDailyLimit
          ? getContent(k("proBenefitAiLimit"), [n.format(b.proAiDailyLimit)])
          : getContent(k("proBenefitAiUnlimited")),
        note: b.freeAiDailyLimit
          ? getContent(k("proBenefitAiFreeNote"), [n.format(b.freeAiDailyLimit)])
          : undefined,
      });
    if (b.bookingDiscountEnabled && b.bookingDiscountPercent > 0)
      out.push({
        key: "visit",
        icon: <StetoscopeIcon />,
        title: getContent(k("proBenefitVisit"), [n.format(b.bookingDiscountPercent)]),
        note: b.bookingDiscountMax
          ? getContent(k("proBenefitVisitNote"), [currencize(b.bookingDiscountMax)])
          : getContent(k("proBenefitVisitNoteNoCap")),
      });
    if (b.bookingDiscountEnabled && b.familyEnabled && b.bookingDiscountPercent > 0)
      out.push({
        key: "family",
        icon: <UserCheckIcon />,
        title: getContent(k("proBenefitFamily")),
        note: getContent(k("proBenefitFamilyNote")),
      });
    if (b.deliveryEnabled && b.deliveryPercentOff > 0)
      out.push({
        key: "delivery",
        icon: <TruckIcon />,
        title:
          b.deliveryPercentOff >= 100
            ? getContent(k("proBenefitDeliveryFree"))
            : getContent(k("proBenefitDeliveryOff"), [n.format(b.deliveryPercentOff)]),
        note: b.deliveryFreeAbove
          ? getContent(k("proBenefitDeliveryNote"), [currencize(b.deliveryFreeAbove)])
          : undefined,
      });
    if (b.cancelEnabled)
      out.push({
        key: "cancel",
        icon: <ClockIcon />,
        title: getContent(k("proBenefitCancel"), [n.format(b.proFreeCancelHours)]),
        note: getContent(k("proBenefitCancelNote"), [n.format(b.baseFreeCancelHours)]),
      });
    if (b.supportEnabled)
      out.push({
        key: "support",
        icon: <HeadphoneIcon />,
        title: getContent(k("proBenefitSupport")),
        note: getContent(k("proBenefitSupportNote")),
      });
    return out;
  }, [b, getContent, intlTag]);
};

const ProBenefitList = ({ benefits, compact }: { benefits: IProBenefits | null | undefined; compact?: boolean }) => {
  const list = useProBenefits(benefits);
  if (!list.length) return null;
  return (
    <ul className={`${classes.benefits} ${compact ? classes.benefitsCompact : ""}`}>
      {list.map((item) => (
        <li key={item.key} className={classes.benefit}>
          <span className={`${classes.benefitIcon} glassIcon`}>
            <Ixon width="1.125rem">{item.icon}</Ixon>
          </span>
          <span className={classes.benefitText}>
            <strong>{item.title}</strong>
            {!!item.note && !compact && <span>{item.note}</span>}
          </span>
        </li>
      ))}
    </ul>
  );
};

export default ProBenefitList;
