"use client";

import { useState } from "react";
import useSWR from "swr";
import classes from "./ProviderHome.module.css";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { useIntlLocale, useLocale } from "@/Components/i18n/navigation";
import { localeDir } from "@/Components/i18n/locales";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import DailyBarChart from "@/Components/UI/DailyBarChart";

const NS: ContentNamespace[] = ["common", "providerHome"];

type Measure = "orders" | "revenue" | "visits";

type Stats = {
  days?: number;
  // clinic / hospital: how many doctor offices are linked to the centre
  offices?: number;
  series?: ({ date?: string } & Partial<Record<Measure, number>>)[];
  totals?: Partial<Record<Measure, number>>;
};

const measureLabel = {
  orders: "homeTrendOrders",
  revenue: "homeTrendSales",
  visits: "homeTrendVisits",
} as const;

// Last-30-days trend on a centre's home: orders / sales for sellers
// (pharmacy, paraclinic), visits at linked offices for clinics / hospitals.
// Orders and sales have different scales, so they're two views of one chart
// (a toggle), never a dual-axis chart.
const ProviderTrend = ({
  kind,
}: {
  kind: "pharmacy" | "paraClinic" | "clinic" | "hospital";
}) => {
  const getContent = useScopedLocale(NS);
  const locale = useIntlLocale();
  const rtl = localeDir(useLocale()) === "rtl";
  const seller = kind === "pharmacy" || kind === "paraClinic";
  const measures: Measure[] = seller ? ["orders", "revenue"] : ["visits"];
  const [selected, setMeasure] = useState<Measure>(measures[0]);
  const measure = measures.includes(selected) ? selected : measures[0];
  const { data } = useSWR<Stats>(
    `${API}/${kind}/${seller ? "order" : "reservation"}/stats`,
    (url: string) => fetcher({ url }).then((res) => res.data),
  );
  if (!data) return null;

  const num = new Intl.NumberFormat(locale);
  const series = Array.isArray(data.series) ? data.series : [];
  const days = num.format(data.days || series.length);
  const total = Number(data.totals?.[measure]) || 0;
  const toman = getContent("toman");
  // nothing is linked to this centre yet - explain instead of an empty chart
  const noOffices = !seller && data.offices === 0;
  const format = (value: number) =>
    measure === "revenue" ? `${num.format(value)} ${toman}` : num.format(value);

  return (
    <section className={classes.section}>
      <div className={classes.trendHead}>
        <h2 className={classes.title}>{getContent("homeTrend")}</h2>
        {measures.length > 1 && (
          <div className={classes.segment} role="tablist">
            {measures.map((key) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={measure === key}
                className={measure === key ? classes.segmentActive : ""}
                onClick={() => setMeasure(key)}
              >
                {getContent(measureLabel[key])}
              </button>
            ))}
          </div>
        )}
      </div>
      {noOffices && (
        <p className={classes.hint}>{getContent("homeVisitsNoOffices")}</p>
      )}
      {!noOffices && (
        <div className={classes.chartCard}>
          <DailyBarChart
            title={getContent(measureLabel[measure])}
            locale={locale}
            rtl={rtl}
            points={series.map((p) => ({
              date: String(p?.date || ""),
              value: Number(p?.[measure]) || 0,
            }))}
            formatValue={format}
            labels={{
              summary: getContent("homeTrendSummary")
                .replace("${1}", format(total))
                .replace("${2}", days),
              chart: getContent("homeChartView"),
              table: getContent("homeTableView"),
              day: getContent("homeDay"),
              value: getContent(measureLabel[measure]),
            }}
          />
        </div>
      )}
    </section>
  );
};

export default ProviderTrend;
