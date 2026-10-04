"use client";

import { useEffect, useMemo, useState } from "react";
import classes from "./Pro.module.css";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentKey } from "@/Components/Enums/contentKeys";
import { useIntlLocale } from "@/Components/i18n/navigation";
import { currencize } from "@/Components/helpers/currencize";
import Link from "@/Components/i18n/Link";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import LicensePromotionBanner from "@/Components/_Common/License/LicensePromotionBanner";
import ProBenefitList from "./ProBenefitList";
import ProPriceOptions from "./ProPriceOptions";
import { IProBenefits, useMyPro, useProPricing } from "./useProData";

const k = (key: string) => key as ContentKey;

// Free tier vs «پرو», row by row, from the same config the server enforces
const useCompareRows = (b: IProBenefits) => {
  const getContent = useScopedLocale();
  const intlTag = useIntlLocale();
  return useMemo(() => {
    const n = new Intl.NumberFormat(intlTag);
    const rows: { label: string; free: string; pro: string }[] = [];
    if (b.aiEnabled)
      rows.push({
        label: getContent(k("proRowAi")),
        free: b.freeAiDailyLimit
          ? getContent(k("proPerDay"), [n.format(b.freeAiDailyLimit)])
          : getContent(k("proUnlimited")),
        pro: b.proAiDailyLimit ? getContent(k("proPerDay"), [n.format(b.proAiDailyLimit)]) : getContent(k("proUnlimited")),
      });
    if (b.bookingDiscountEnabled && b.bookingDiscountPercent > 0)
      rows.push({
        label: getContent(k("proRowVisit")),
        free: "—",
        pro: getContent(k("proPercentOff"), [n.format(b.bookingDiscountPercent)]),
      });
    if (b.deliveryEnabled && b.deliveryPercentOff > 0)
      rows.push({
        label: getContent(k("proRowDelivery")),
        free: getContent(k("proRowDeliveryFree")),
        pro:
          b.deliveryPercentOff >= 100
            ? getContent(k("proBenefitDeliveryFree"))
            : getContent(k("proPercentOff"), [n.format(b.deliveryPercentOff)]),
      });
    if (b.cancelEnabled)
      rows.push({
        label: getContent(k("proRowCancel")),
        free: getContent(k("proHoursBefore"), [n.format(b.baseFreeCancelHours)]),
        pro: getContent(k("proHoursBefore"), [n.format(b.proFreeCancelHours)]),
      });
    if (b.supportEnabled)
      rows.push({
        label: getContent(k("proRowSupport")),
        free: getContent(k("proRowSupportFree")),
        pro: getContent(k("proRowSupportPro")),
      });
    return rows;
  }, [b, getContent, intlTag]);
};

// Public «پرو» page (/pro, 2026-10): what the membership gives, its prices
// with the running launch promotion struck through, and the way in - the
// shape of Amazon One Medical's / Practo Plus's membership page. Built only
// from what the server enforces (GET /pro/pricing).
const ProPage = () => {
  const getContent = useScopedLocale();
  const { data, error } = useProPricing();
  const { data: mine } = useMyPro();
  const options = useMemo(() => data?.options || [], [data]);
  const [selected, setSelected] = useState<number | null>(null);
  useEffect(() => {
    if (!options.length) return;
    if (selected && options.some((o) => o.days === selected)) return;
    // the longest period first: the biggest discount sells the plan
    setSelected(options[options.length - 1].days);
  }, [options, selected]);
  const rows = useCompareRows(
    data?.benefits || ({} as IProBenefits),
  );
  const chosen = options.find((o) => o.days === selected) || null;
  const name = data?.plan?.displayName || getContent(k("proName"));

  return (
    <div className={`${classes.page} ${classes.publicPage}`}>
      <section className={classes.hero}>
        <h1 className={classes.heroTitle}>
          {getContent(k("proHeroTitle"), [name])}
        </h1>
        <p className={classes.heroLead}>{data?.plan?.summary || getContent(k("proHeroLead"))}</p>
        {mine?.active && (
          <p className={classes.muted}>{getContent(k("proYouAreMember"))}</p>
        )}
      </section>

      <HandleLoading data={!!data} error={error}>
        {!!data && (
          <>
            <section className={classes.card} aria-labelledby="pro-benefits">
              <h2 id="pro-benefits" className={classes.cardTitle}>
                {getContent(k("proBenefitsTitle"))}
              </h2>
              <ProBenefitList benefits={data.benefits} />
            </section>

            <section className={classes.card} aria-labelledby="pro-prices">
              <h2 id="pro-prices" className={classes.cardTitle}>
                {getContent(k("proPricesTitle"))}
              </h2>
              {data.onSale && options.length ? (
                <>
                  <LicensePromotionBanner promotions={data.promotions} />
                  <ProPriceOptions options={options} selected={selected} onSelect={setSelected} />
                  <div className={classes.actions}>
                    <Link
                      href={`/dashboard/pro${chosen ? `?days=${chosen.days}` : ""}`}
                      className={classes.cta}
                    >
                      {mine?.active
                        ? getContent(k("proRenew"))
                        : chosen
                          ? getContent(k("proJoinFor"), [currencize(chosen.quoted)])
                          : getContent(k("proJoin"))}
                    </Link>
                    <span className={classes.muted}>{getContent(k("proPayNote"))}</span>
                  </div>
                </>
              ) : (
                <p className={classes.muted}>{getContent(k("proNotOnSale"))}</p>
              )}
            </section>

            {rows.length > 0 && (
              <section className={classes.card} aria-labelledby="pro-compare">
                <h2 id="pro-compare" className={classes.cardTitle}>
                  {getContent(k("proCompareTitle"))}
                </h2>
                <div className={classes.compareScroll}>
                  <table className={classes.compare}>
                    <thead>
                      <tr>
                        <th scope="col">{getContent(k("proCompareFeature"))}</th>
                        <th scope="col">{getContent(k("proCompareFree"))}</th>
                        <th scope="col">{name}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((r) => (
                        <tr key={r.label}>
                          <td>{r.label}</td>
                          <td>{r.free}</td>
                          <td>{r.pro}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className={classes.muted}>{getContent(k("proFairNote"))}</p>
              </section>
            )}
          </>
        )}
      </HandleLoading>
    </div>
  );
};

export default ProPage;
