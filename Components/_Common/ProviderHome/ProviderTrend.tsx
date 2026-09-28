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

type Stats = {
  days?: number;
  series?: { date?: string; orders?: number; revenue?: number }[];
  totals?: { orders?: number; revenue?: number };
};

// Last-30-days orders / sales for a seller panel. Orders and sales have
// different scales, so they're two views of one chart (a toggle), never a
// dual-axis chart.
const ProviderTrend = ({ kind }: { kind: "pharmacy" | "paraClinic" }) => {
  const getContent = useScopedLocale(NS);
  const locale = useIntlLocale();
  const rtl = localeDir(useLocale()) === "rtl";
  const [measure, setMeasure] = useState<"orders" | "revenue">("orders");
  const { data } = useSWR<Stats>(`${API}/${kind}/order/stats`, (url: string) =>
    fetcher({ url }).then((res) => res.data),
  );
  if (!data) return null;

  const num = new Intl.NumberFormat(locale);
  const series = Array.isArray(data.series) ? data.series : [];
  const days = num.format(data.days || series.length);
  const total = Number(data.totals?.[measure]) || 0;
  const toman = getContent("toman");
  const format = (value: number) =>
    measure === "revenue" ? `${num.format(value)} ${toman}` : num.format(value);

  return (
    <section className={classes.section}>
      <div className={classes.trendHead}>
        <h2 className={classes.title}>{getContent("homeTrend")}</h2>
        <div className={classes.segment} role="tablist">
          {(["orders", "revenue"] as const).map((key) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={measure === key}
              className={measure === key ? classes.segmentActive : ""}
              onClick={() => setMeasure(key)}
            >
              {getContent(key === "orders" ? "homeTrendOrders" : "homeTrendSales")}
            </button>
          ))}
        </div>
      </div>
      <div className={classes.chartCard}>
        <DailyBarChart
          title={getContent(measure === "orders" ? "homeTrendOrders" : "homeTrendSales")}
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
            value: getContent(measure === "orders" ? "homeTrendOrders" : "homeTrendSales"),
          }}
        />
      </div>
    </section>
  );
};

export default ProviderTrend;
