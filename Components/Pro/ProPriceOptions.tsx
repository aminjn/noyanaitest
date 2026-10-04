"use client";

import classes from "./Pro.module.css";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentKey } from "@/Components/Enums/contentKeys";
import { useIntlLocale } from "@/Components/i18n/navigation";
import { currencize } from "@/Components/helpers/currencize";
import useLicensePeriodLabel from "@/Components/_Common/License/useLicensePeriodLabel";
import { ILicenseQuote } from "@/Components/_Common/License/useLicenseQuotes";
import LicensePromotionCountdown from "@/Components/_Common/License/LicensePromotionCountdown";
import { perMonth } from "./useProData";

const k = (key: string) => key as ContentKey;

// The «پرو» price options (1 / 3 / 12 months): the server's quote of each -
// the option's own discount and a running promotion - with the list price
// struck through, the percent off and the price per month. A radio group.
const ProPriceOptions = ({
  options,
  selected,
  onSelect,
}: {
  options: ILicenseQuote[];
  selected: number | null;
  onSelect: (days: number) => void;
}) => {
  const getContent = useScopedLocale();
  const intlTag = useIntlLocale();
  const periodLabel = useLicensePeriodLabel();
  const n = new Intl.NumberFormat(intlTag);
  const list = Array.isArray(options) ? options : [];
  if (!list.length) return null;
  const best = list.reduce((a, b) => (b.percentOff > a.percentOff ? b : a), list[0]);
  return (
    <div className={classes.options} role="radiogroup" aria-label={getContent(k("proChoosePeriod"))}>
      {list.map((q) => {
        const active = selected === q.days;
        const struck = q.listPrice > q.quoted;
        return (
          <button
            key={q.days}
            type="button"
            role="radio"
            aria-checked={active}
            className={`${classes.option} ${active ? classes.optionActive : ""}`}
            onClick={() => onSelect(q.days)}
          >
            <span className={classes.optionHead}>
              <span className={classes.optionPeriod}>{periodLabel(q.days)}</span>
              {q.percentOff > 0 && (
                <span className={classes.offBadge}>{getContent(k("proPercentOff"), [n.format(q.percentOff)])}</span>
              )}
            </span>
            {best === q && q.percentOff > 0 && list.length > 1 && (
              <span className={classes.bestValue}>{getContent(k("proBestValue"))}</span>
            )}
            <span className={classes.priceRow}>
              <strong className={classes.price}>{currencize(q.quoted)}</strong>
              <span className={classes.unit}>{getContent("toman")}</span>
            </span>
            {struck && <s className={classes.listPrice}>{currencize(q.listPrice)}</s>}
            {q.days > 30 && (
              <span className={classes.monthly}>
                {getContent(k("proPerMonth"), [currencize(perMonth(q))])}
              </span>
            )}
            {!!q.promotion && (
              <span className={classes.promo}>
                <span>{q.promotion.title || getContent("specialDiscount" as ContentKey)}</span>
                {!!q.promotion.endsAt && <LicensePromotionCountdown endsAt={q.promotion.endsAt} />}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default ProPriceOptions;
