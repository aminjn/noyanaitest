"use client";

import classes from "./Pro.module.css";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentKey } from "@/Components/Enums/contentKeys";
import { currencize } from "@/Components/helpers/currencize";
import Link from "@/Components/i18n/Link";
import Ixon from "@/Components/UI/Ixon";
import CrownIcon from "@/Components/Icons/CrownIcon";
import ChevronIcon from "@/Components/Icons/ChevronIcon";

const k = (key: string) => key as ContentKey;

export type ProUpsellMoment = "home" | "ai" | "delivery" | "booking";

const texts: Record<ProUpsellMoment, { title: string; body: string }> = {
  home: { title: "proUpsellHomeTitle", body: "proUpsellHomeBody" },
  ai: { title: "proUpsellAiTitle", body: "proUpsellAiBody" },
  delivery: { title: "proUpsellDeliveryTitle", body: "proUpsellDeliveryBody" },
  booking: { title: "proUpsellBookingTitle", body: "proUpsellBookingBody" },
};

// The «پرو» offer at the moment a benefit matters (2026-10): the dashboard
// home, the AI assistant's daily limit, the checkout's delivery fee and the
// booking's discount line. `amount` is what Pro would save right here (the
// server's figure). Links to the public /pro page.
const ProUpsellCard = ({
  moment,
  amount,
  className = "",
}: {
  moment: ProUpsellMoment;
  amount?: number;
  className?: string;
}) => {
  const getContent = useScopedLocale();
  const t = texts[moment];
  return (
    <Link href="/pro" className={`${classes.upsell} ${className}`}>
      <span className={`${classes.upsellIcon} glassIcon tone-amber`}>
        <Ixon width="1.25rem">
          <CrownIcon />
        </Ixon>
      </span>
      <span className={classes.upsellText}>
        <strong>{getContent(k(t.title))}</strong>
        <span>
          {amount && amount > 0
            ? getContent(k("proUpsellSave"), [currencize(amount)])
            : getContent(k(t.body))}
        </span>
      </span>
      <span className={classes.upsellCta}>
        {getContent(k("proSeePlans"))}
        <Ixon width="0.85rem" className={classes.chevron}>
          <ChevronIcon />
        </Ixon>
      </span>
    </Link>
  );
};

export default ProUpsellCard;
