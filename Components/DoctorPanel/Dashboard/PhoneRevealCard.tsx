"use client";

import { useMemo } from "react";
import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { useIntlLocale } from "@/Components/i18n/navigation";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import Link from "@/Components/i18n/Link";
import classes from "./PhoneRevealCard.module.css";

const NS: ContentNamespace[] = ["common", "doctorPanelHome"];

type Stats = {
  today: number;
  week: number;
  month: number;
  series: { date: string; count: number }[];
  hasPhone: boolean;
};

// «نمایش شماره‌ی شما» (2026-10): how often patients revealed the doctor's
// public number on their page - Doctolib / Docplanner sell this "calls from
// your profile" figure in their pro tools (backend phoneRevealController)
const PhoneRevealCard = () => {
  const getContent = useScopedLocale(NS);
  const intlTag = useIntlLocale();
  const num = useMemo(() => new Intl.NumberFormat(intlTag), [intlTag]);
  const { data } = useSWR<Stats>(`${API}/doctor/phone-reveals/stats`, (url: string) =>
    fetcher<{ data: Stats }>({ url }).then((res) => res.data),
  );
  if (!data) return null;
  const series = Array.isArray(data.series) ? data.series : [];
  const max = Math.max(1, ...series.map((p) => p.count || 0));
  return (
    <section className={classes.main} aria-labelledby="dpd-phone-reveals">
      <div className={classes.head}>
        <h2 id="dpd-phone-reveals" className={classes.title}>
          {getContent("dpdPrTitle")}
        </h2>
        <p className={classes.hint}>{getContent("dpdPrHint")}</p>
      </div>
      {!data.hasPhone ? (
        <Link href="/doctorpanel/profile" className={classes.empty}>
          {getContent("dpdPrNoPhone")}
        </Link>
      ) : (
        <div className={classes.body}>
          <dl className={classes.stats}>
            <div>
              <dt>{getContent("dpdPrToday")}</dt>
              <dd>{num.format(data.today || 0)}</dd>
            </div>
            <div>
              <dt>{getContent("dpdPr7")}</dt>
              <dd>{num.format(data.week || 0)}</dd>
            </div>
            <div>
              <dt>{getContent("dpdPr30")}</dt>
              <dd>{num.format(data.month || 0)}</dd>
            </div>
          </dl>
          {/* the last 30 Tehran days, one bar each */}
          <div className={classes.bars} aria-hidden>
            {series.map((p) => (
              <span key={p.date} style={{ blockSize: `${Math.max(4, ((p.count || 0) / max) * 100)}%` }} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default PhoneRevealCard;
