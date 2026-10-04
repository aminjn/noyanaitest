"use client";

import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import classes from "../../Accounting.module.css";
import { asArray, useBizFormat } from "../../bizShared";
import { downloadCsv, useFin, useFinText } from "../finShared";
import ai from "./FinAi.module.css";
import { AiInsight } from "./finAi";

type Horizon = {
  days: number;
  inflow: number;
  outflow: number;
  closing: number;
  negative: boolean;
  low: { balance: number; date: string };
  inflows: Record<string, number>;
  outflows: Record<string, number>;
};
type Forecast = {
  opening: number;
  accounts: { name: string; kind: string; balance: number }[];
  horizons: Horizon[];
  months: { label: string; inflow: number; outflow: number; net: number; balance: number; negative: boolean }[];
  firstNegative: string | null;
  events: { date: string; amount: number; kind: string; label: string }[];
  assumptions: { avgMonthlyIncome: number; avgMonthlyExpense: number; insurerShare: number; collectionRate: number; recurringMonthly: number; runIn: number; runOut: number };
};

const flowKey = (k: string) => `faiFlow_${k}`;

// Nexxa's cash-forecast page: the cash now, the dated flows ahead (cheques
// by due date, recurring expenses, unpaid bills, insurer claims after their
// usual delay and collection rate, salaries and VAT owed) and the run rate
// of the last three months - all computed in code; the AI only explains.
const CashForecast = () => {
  const t = useFinText();
  const f = useBizFormat();
  const { api } = useFin();
  const { data, error } = useSWR<Forecast>(`${API}${api}/ai/forecast`, (url: string) => fetcher({ url }).then((res) => res.data as Forecast), { revalidateOnFocus: false });
  const months = asArray<Forecast["months"][number]>(data?.months);
  const horizons = asArray<Horizon>(data?.horizons);
  const events = asArray<Forecast["events"][number]>(data?.events);
  // a Jalali month label "1405/08" in the reader's calendar digits
  const mlabel = (l: string) => {
    const [y, m] = String(l || "").split("/");
    return y && m ? `${f.year(Number(y))}/${f.year(Number(m))}` : l;
  };
  const exportCsv = () =>
    downloadCsv("cash-forecast", [
      [t("faiPeriod"), t("faiInflow"), t("faiOutflow"), t("faiNet"), t("faiClosing")],
      ...months.map((r) => [r.label, r.inflow, r.outflow, r.net, r.balance]),
    ]);
  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <>
          <AiInsight kind="forecast" label={t("faiInsightForecast")} />
          {!!data.firstNegative && <p className={ai.alert}>{t("faiNegativeAlert", [mlabel(data.firstNegative)])}</p>}
          <div className={classes.tiles}>
            <div className={`${classes.tile} ${classes.primaryTile}`}>
              <span className={classes.tileLabel}>{t("faiCashNow")}</span>
              <span className={classes.tileValue}>
                {f.signed(data.opening)}
                <span className={classes.tileUnit}>{t("toman")}</span>
              </span>
            </div>
            <div className={classes.tile}>
              <span className={classes.tileLabel}>{t("faiBurn")}</span>
              <span className={classes.tileValue}>
                {f.money((data.assumptions?.runOut || 0) + (data.assumptions?.recurringMonthly || 0))}
                <span className={classes.tileUnit}>{t("toman")}</span>
              </span>
            </div>
            <div className={classes.tile}>
              <span className={classes.tileLabel}>{t("faiClosing90")}</span>
              <span className={`${classes.tileValue} ${(horizons[2]?.closing || 0) < 0 ? classes.negative : classes.positive}`}>
                {f.signed(horizons[2]?.closing)}
                <span className={classes.tileUnit}>{t("toman")}</span>
              </span>
            </div>
          </div>

          <div className={ai.horizons}>
            {horizons.map((h) => (
              <section key={h.days} className={classes.card}>
                <div className={classes.cardHead}>
                  <span className={classes.cardTitle}>{t("faiNextDays", [f.money(h.days)])}</span>
                  <b className={h.closing < 0 ? classes.negative : ""}>{f.signed(h.closing)}</b>
                </div>
                <ul className={ai.flowList}>
                  {Object.entries(h.inflows || {}).map(([k, v]) => (
                    <li key={`i${k}`}>
                      <span>+ {t(flowKey(k))}</span>
                      <span>{f.money(v)}</span>
                    </li>
                  ))}
                  {Object.entries(h.outflows || {}).map(([k, v]) => (
                    <li key={`o${k}`}>
                      <span>− {t(flowKey(k))}</span>
                      <span className={classes.negative}>{f.money(v)}</span>
                    </li>
                  ))}
                </ul>
                <p className={classes.muted}>{t("faiLowPoint", [f.signed(h.low?.balance), f.date(h.low?.date)])}</p>
              </section>
            ))}
          </div>

          <section className={classes.card}>
            <div className={classes.cardHead}>
              <span className={classes.cardTitle}>{t("faiMonthByMonth")}</span>
              <button type="button" className={classes.ghost} onClick={exportCsv} disabled={!months.length}>
                {t("finExportCsv")}
              </button>
            </div>
            <div className={classes.tableWrap}>
              <table className={classes.table}>
                <thead>
                  <tr>
                    <th>{t("faiPeriod")}</th>
                    <th className={classes.num}>{t("faiInflow")}</th>
                    <th className={classes.num}>{t("faiOutflow")}</th>
                    <th className={classes.num}>{t("faiNet")}</th>
                    <th className={classes.num}>{t("faiClosing")}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan={4} className={classes.muted}>
                      {t("faiOpening")}
                    </td>
                    <td className={classes.num}>{f.signed(data.opening)}</td>
                  </tr>
                  {months.map((r) => (
                    <tr key={r.label}>
                      <td>{mlabel(r.label)}</td>
                      <td className={`${classes.num} ${classes.positive}`}>{r.inflow > 0 ? f.money(r.inflow) : "—"}</td>
                      <td className={`${classes.num} ${classes.negative}`}>{r.outflow > 0 ? f.money(r.outflow) : "—"}</td>
                      <td className={`${classes.num} ${r.net < 0 ? classes.negative : ""}`}>{f.signed(r.net)}</td>
                      <td className={`${classes.num} ${r.negative ? classes.negative : ""}`}>
                        <b>{f.signed(r.balance)}</b>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {events.length > 0 && (
            <section className={classes.card}>
              <span className={classes.cardTitle}>{t("faiBiggestFlows")}</span>
              <div className={classes.tableWrap}>
                <table className={classes.table}>
                  <thead>
                    <tr>
                      <th>{t("bizDate")}</th>
                      <th>{t("faiFlowKind")}</th>
                      <th>{t("bizDescription")}</th>
                      <th className={classes.num}>{t("bizAmount")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.map((e, i) => (
                      <tr key={i}>
                        <td>{f.date(e.date)}</td>
                        <td>{t(flowKey(e.kind))}</td>
                        <td className={classes.wrap}>{e.kind === "payroll" || e.kind === "vat" ? "—" : e.label || "—"}</td>
                        <td className={`${classes.num} ${e.amount < 0 ? classes.negative : classes.positive}`}>{f.signed(e.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
          <p className={classes.muted}>
            {t("faiForecastBasis", [
              f.money(data.assumptions?.avgMonthlyIncome),
              f.money(data.assumptions?.avgMonthlyExpense),
              f.money(data.assumptions?.insurerShare),
              f.money(data.assumptions?.collectionRate),
            ])}
          </p>
        </>
      )}
    </HandleLoading>
  );
};

export default CashForecast;
