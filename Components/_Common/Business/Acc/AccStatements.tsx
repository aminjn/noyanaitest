"use client";

import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import classes from "../Accounting.module.css";
import acc from "./Acc.module.css";
import { asArray, BizAccount, isoDay, useBiz, useBizFormat } from "../bizShared";
import { CashFlow } from "../AccountingReports";
import { ExportBar, monthStart, RangeFilter, SimplePopup, SubNav, useAccPopup, useAccText, useView } from "./accShared";
import { LedgerView } from "./AccBooks";

// The financial statements (2026-10), after Nexxa's accounting/reports
// (financial-statements core) with its notes (یادداشت‌های همراه: each line
// of a statement broken down by its معین accounts) and cash-flow: the
// classified income statement (revenue, cost of sales, gross profit,
// operating expenses, net) and the balance sheet at the کل level, each with
// a comparative column (the previous period of the same length, or the
// same period a year before).

type Compare = "none" | "prev" | "year";

const useRows = (from: Date | null, to: Date | null, refreshKey: number) => {
  const { api } = useBiz();
  const p = new URLSearchParams();
  if (from) p.set("from", isoDay(from));
  if (to) p.set("to", isoDay(to));
  const swr = useSWR<BizAccount[]>(api ? `${API}${api}/accounts?${p}` : null, (url: string) => fetcher({ url }).then((r) => asArray<BizAccount>(r.data)));
  const { mutate } = swr;
  useEffect(() => {
    mutate();
  }, [refreshKey, mutate]);
  return swr;
};

const shift = (from: Date | null, to: Date | null, mode: Compare): [Date | null, Date | null] => {
  if (mode === "none") return [null, null];
  const end = to || new Date();
  if (mode === "year") {
    const y = (d: Date) => new Date(d.getFullYear() - 1, d.getMonth(), d.getDate(), d.getHours());
    return [from ? y(from) : null, y(end)];
  }
  const start = from || new Date(end.getFullYear(), 0, 1);
  const len = end.getTime() - start.getTime();
  return [new Date(start.getTime() - len - 864e5), new Date(start.getTime() - 864e5)];
};

const isCogs = (a: BizAccount) => a.code.startsWith("73") || a.role === "cogs";

const IncomeStatement = ({ from, to, compare, refreshKey }: { from: Date | null; to: Date | null; compare: Compare; refreshKey: number }) => {
  const t = useAccText();
  const f = useBizFormat();
  const { open } = useAccPopup();
  const ref = useRef<HTMLDivElement>(null);
  const [cf, ct] = shift(from, to, compare);
  const cur = useRows(from, to, refreshKey);
  const prev = useRows(cf, ct, refreshKey);
  const rows = asArray<BizAccount>(cur.data);
  const prevRows = asArray<BizAccount>(compare === "none" ? [] : prev.data);
  const prevOf = (code: string) => prevRows.find((r) => r.code === code)?.period || 0;
  const totals = rows.filter((r) => r.level === "total");
  const income = totals.filter((r) => r.type === "income" && (r.period || prevOf(r.code)));
  const cogs = totals.filter((r) => r.type === "expense" && isCogs(r) && (r.period || prevOf(r.code)));
  const opex = totals.filter((r) => r.type === "expense" && !isCogs(r) && (r.period || prevOf(r.code)));
  const sum = (list: BizAccount[], p = false) => list.reduce((s, r) => s + (p ? prevOf(r.code) : r.period || 0), 0);
  const revenue = sum(income);
  const gross = revenue - sum(cogs);
  const net = gross - sum(opex);
  const pRevenue = sum(income, true);
  const pGross = pRevenue - sum(cogs, true);
  const pNet = pGross - sum(opex, true);
  const children = (r: BizAccount) => rows.filter((x) => x.parentCode === r.code && x.level === "detail" && (x.period || prevOf(x.code)));
  const line = (label: string, v: number, p: number, strong?: boolean) => (
    <tr className={strong ? classes.totalRow : undefined}>
      <td className={classes.wrap}>{label}</td>
      <td className={classes.num}>{f.signed(v)}</td>
      {compare !== "none" && <td className={classes.num}>{f.signed(p)}</td>}
    </tr>
  );
  const section = (title: string, list: BizAccount[]) => (
    <>
      <tr className={classes.groupRow}>
        <td>{title}</td>
        <td />
        {compare !== "none" && <td />}
      </tr>
      {list.map((r) => (
        <tr key={r._id} className={classes.rowLink} onClick={() => open("AccLedger", <SimplePopup title={`${r.code} · ${r.name}`} wide><LedgerView fixed={{ account: r._id }} /></SimplePopup>)}>
          <td className={`${classes.wrap} ${acc.depth1}`}>{r.name}</td>
          <td className={classes.num}>{f.signed(r.period)}</td>
          {compare !== "none" && <td className={classes.num}>{f.signed(prevOf(r.code))}</td>}
        </tr>
      ))}
    </>
  );
  const notes = [...income, ...cogs, ...opex].filter((r) => children(r).length);
  return (
    <HandleLoading data={!!cur.data} error={cur.error}>
      <ExportBar
        printRef={ref}
        sheet={() => ({
          title: t("bizIncomeStatement"),
          head: [t("bizName"), t("accCurrentPeriod"), ...(compare !== "none" ? [t("accComparePeriod")] : [])],
          rows: [...income, ...cogs, ...opex].map((r) => [r.name, Math.round(r.period), ...(compare !== "none" ? [Math.round(prevOf(r.code))] : [])]).concat([[t("bizNetProfit"), Math.round(net), ...(compare !== "none" ? [Math.round(pNet)] : [])]]),
        })}
      />
      <div ref={ref} className={classes.main}>
        <div className={classes.tableWrap}>
          <table className={classes.table}>
            <thead>
              <tr>
                <th />
                <th className={classes.num}>{t("accCurrentPeriod")}</th>
                {compare !== "none" && <th className={classes.num}>{t("accComparePeriod")}</th>}
              </tr>
            </thead>
            <tbody>
              {section(t("accRevenue"), income)}
              {line(t("accTotalRevenue"), revenue, pRevenue, true)}
              {!!cogs.length && section(t("accCostOfSales"), cogs)}
              {line(t("accGrossProfit"), gross, pGross, true)}
              {section(t("accOperatingExpenses"), opex)}
              {line(t("bizNetProfit"), net, pNet, true)}
            </tbody>
          </table>
        </div>
        <Notes notes={notes} kids={children} value={(r) => r.period} prev={compare !== "none" ? (r) => prevOf(r.code) : undefined} />
      </div>
    </HandleLoading>
  );
};

const Notes = ({ notes, kids, value, prev }: { notes: BizAccount[]; kids: (r: BizAccount) => BizAccount[]; value: (r: BizAccount) => number; prev?: (r: BizAccount) => number }) => {
  const t = useAccText();
  const f = useBizFormat();
  if (!notes.length) return null;
  return (
    <div className={classes.main}>
      <h3 className={classes.cardTitle}>{t("accNotes")}</h3>
      <div className={classes.tableWrap}>
        <table className={classes.table}>
          <tbody>
            {notes.map((n, i) => (
              <Fragment key={n._id}>
                <tr className={classes.groupRow}>
                  <td>{t("accNoteN", [f.money(i + 1), n.name])}</td>
                  <td className={classes.num}>{f.signed(value(n))}</td>
                  {prev && <td className={classes.num}>{f.signed(prev(n))}</td>}
                </tr>
                {kids(n).map((c) => (
                  <tr key={c._id}>
                    <td className={`${classes.wrap} ${acc.depth1}`}>
                      {c.code} · {c.name}
                    </td>
                    <td className={classes.num}>{f.signed(value(c))}</td>
                    {prev && <td className={classes.num}>{f.signed(prev(c))}</td>}
                  </tr>
                ))}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
      <p className={classes.muted}>{t("accNotesHint")}</p>
    </div>
  );
};

const BalanceSheet = ({ to, compare, from, refreshKey }: { to: Date | null; from: Date | null; compare: Compare; refreshKey: number }) => {
  const t = useAccText();
  const f = useBizFormat();
  const { open } = useAccPopup();
  const ref = useRef<HTMLDivElement>(null);
  const [, ct] = shift(from, to, compare);
  const cur = useRows(null, to, refreshKey);
  const prev = useRows(null, compare === "none" ? null : ct, refreshKey);
  const rows = asArray<BizAccount>(cur.data);
  const prevRows = asArray<BizAccount>(compare === "none" ? [] : prev.data);
  const prevOf = (code: string) => prevRows.find((r) => r.code === code)?.balance || 0;
  const totals = rows.filter((r) => r.level === "total");
  const of = (type: string) => totals.filter((r) => r.type === type && (r.balance || prevOf(r.code)));
  const assets = of("asset");
  const liabilities = of("liability");
  const equity = of("equity");
  const s = (list: BizAccount[], p = false) => list.reduce((x, r) => x + (p ? prevOf(r.code) : r.balance || 0), 0);
  const profit = (list: BizAccount[], p: boolean) =>
    list.filter((r) => r.level === "total" && r.type === "income").reduce((x, r) => x + (p ? prevRows.find((y) => y.code === r.code)?.balance || 0 : r.balance || 0), 0) -
    list.filter((r) => r.level === "total" && r.type === "expense").reduce((x, r) => x + (p ? prevRows.find((y) => y.code === r.code)?.balance || 0 : r.balance || 0), 0);
  const curProfit = profit(rows, false);
  const prevProfit = profit(rows, true);
  const totalAssets = s(assets);
  const totalLE = s(liabilities) + s(equity) + curProfit;
  const balanced = Math.abs(totalAssets - totalLE) < 1;
  const children = (r: BizAccount) => rows.filter((x) => x.parentCode === r.code && x.level === "detail" && (x.balance || prevOf(x.code)));
  const block = (title: string, list: BizAccount[], extra?: [string, number, number]) => (
    <>
      <tr className={classes.groupRow}>
        <td>{title}</td>
        <td />
        {compare !== "none" && <td />}
      </tr>
      {list.map((r) => (
        <tr key={r._id} className={classes.rowLink} onClick={() => open("AccLedger", <SimplePopup title={`${r.code} · ${r.name}`} wide><LedgerView fixed={{ account: r._id }} /></SimplePopup>)}>
          <td className={`${classes.wrap} ${acc.depth1}`}>{r.name}</td>
          <td className={classes.num}>{f.signed(r.balance)}</td>
          {compare !== "none" && <td className={classes.num}>{f.signed(prevOf(r.code))}</td>}
        </tr>
      ))}
      {extra && (
        <tr>
          <td className={`${classes.wrap} ${acc.depth1}`}>{extra[0]}</td>
          <td className={classes.num}>{f.signed(extra[1])}</td>
          {compare !== "none" && <td className={classes.num}>{f.signed(extra[2])}</td>}
        </tr>
      )}
      <tr className={classes.totalRow}>
        <td>{t("bizTotal")}</td>
        <td className={classes.num}>{f.signed(s(list) + (extra ? extra[1] : 0))}</td>
        {compare !== "none" && <td className={classes.num}>{f.signed(s(list, true) + (extra ? extra[2] : 0))}</td>}
      </tr>
    </>
  );
  const notes = [...assets, ...liabilities, ...equity].filter((r) => children(r).length);
  return (
    <HandleLoading data={!!cur.data} error={cur.error}>
      <ExportBar
        printRef={ref}
        sheet={() => ({
          title: t("bizBalanceSheet"),
          head: [t("bizName"), t("accCurrentPeriod"), ...(compare !== "none" ? [t("accComparePeriod")] : [])],
          rows: [...assets, ...liabilities, ...equity].map((r) => [r.name, Math.round(r.balance), ...(compare !== "none" ? [Math.round(prevOf(r.code))] : [])]),
        })}
      />
      <div ref={ref} className={classes.main}>
        <div className={classes.tableWrap}>
          <table className={classes.table}>
            <thead>
              <tr>
                <th />
                <th className={classes.num}>{t("accAtDate")}</th>
                {compare !== "none" && <th className={classes.num}>{t("accComparePeriod")}</th>}
              </tr>
            </thead>
            <tbody>
              {block(t("bizAssets"), assets)}
              {block(t("bizLiabilities"), liabilities)}
              {block(t("bizEquity"), equity, [t("bizCurrentProfit"), curProfit, prevProfit])}
            </tbody>
          </table>
        </div>
        <p className={balanced ? classes.statusOk : classes.statusBad}>
          {t("bizTotalAssets")}: {f.signed(totalAssets)} · {t("bizTotalLiabEquity")}: {f.signed(totalLE)} · {balanced ? t("bizIsBalanced") : t("bizNotBalanced")}
        </p>
        <Notes notes={notes} kids={children} value={(r) => r.balance} prev={compare !== "none" ? (r) => prevOf(r.code) : undefined} />
      </div>
    </HandleLoading>
  );
};

const VIEWS = ["income", "sheet", "cash"] as const;

const AccStatements = ({ refreshKey }: { refreshKey: number }) => {
  const t = useAccText();
  const [view, setView] = useView(VIEWS, "income");
  const [from, setFrom] = useState<Date | null>(monthStart());
  const [to, setTo] = useState<Date | null>(null);
  const [compare, setCompare] = useState<Compare>("none");
  const cmp = useMemo(
    () => (
      <label className={classes.field}>
        <span>{t("accCompare")}</span>
        <select value={compare} onChange={(e) => setCompare(e.target.value as Compare)}>
          <option value="none">{t("accCompareNone")}</option>
          <option value="prev">{t("accComparePrev")}</option>
          <option value="year">{t("accCompareYear")}</option>
        </select>
      </label>
    ),
    [compare, t],
  );
  return (
    <section className={classes.card}>
      <SubNav
        value={view}
        onChange={setView}
        items={[
          ["income", t("bizIncomeStatement")],
          ["sheet", t("bizBalanceSheet")],
          ["cash", t("bizCashFlow")],
        ]}
      />
      <RangeFilter from={from} to={to} setFrom={setFrom} setTo={setTo}>
        {view !== "cash" && cmp}
      </RangeFilter>
      {view === "income" && <IncomeStatement from={from} to={to} compare={compare} refreshKey={refreshKey} />}
      {view === "sheet" && <BalanceSheet from={from} to={to} compare={compare} refreshKey={refreshKey} />}
      {view === "cash" && <CashFlow from={from} to={to} refreshKey={refreshKey} />}
    </section>
  );
};

export default AccStatements;
