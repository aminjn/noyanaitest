"use client";

import { Fragment, useEffect, useState } from "react";
import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import DateInput from "@/Components/UI/DateInput";
import classes from "./Accounting.module.css";
import { asArray, BizAccount, isoDay, useBiz, useBizFormat, useBizText } from "./bizShared";

type Trial = { rows: BizAccount[]; totals: { debit: number; credit: number }; balanced: boolean };
type Income = { income: BizAccount[]; expenses: BizAccount[]; totalIncome: number; totalExpense: number; net: number };
type Sheet = {
  assets: BizAccount[];
  liabilities: BizAccount[];
  equity: BizAccount[];
  profit: number;
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
  balanced: boolean;
};

const useReport = <T,>(path: string, from: Date | null, to: Date | null, refreshKey: number) => {
  const { api } = useBiz();
  const params = new URLSearchParams();
  if (from) params.set("from", isoDay(from));
  if (to) params.set("to", isoDay(to));
  const swr = useSWR<T>(`${API}${api}/${path}?${params}`, (url: string) =>
    fetcher({ url }).then((res) => res.data as T),
  );
  const { mutate } = swr;
  useEffect(() => {
    mutate();
  }, [refreshKey, mutate]);
  return swr;
};

const TrialBalance = ({ from, to, refreshKey }: { from: Date | null; to: Date | null; refreshKey: number }) => {
  const t = useBizText();
  const f = useBizFormat();
  const { data, error } = useReport<Trial>("trial-balance", from, to, refreshKey);
  const rows = asArray<BizAccount>(data?.rows).filter((r) => r.level === "detail" && (r.pD || r.pC || r.balance));
  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <div className={classes.tableWrap}>
          <table className={classes.table}>
            <thead>
              <tr>
                <th>{t("bizCode")}</th>
                <th>{t("bizName")}</th>
                <th className={classes.num}>{t("bizPeriodDebit")}</th>
                <th className={classes.num}>{t("bizPeriodCredit")}</th>
                <th className={classes.num}>{t("bizBalance")}</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td colSpan={5} className={classes.empty}>
                    {t("bizEmpty")}
                  </td>
                </tr>
              )}
              {rows.map((r) => (
                <tr key={r._id}>
                  <td>{r.code}</td>
                  <td className={classes.wrap}>{r.name}</td>
                  <td className={classes.num}>{f.money(r.pD)}</td>
                  <td className={classes.num}>{f.money(r.pC)}</td>
                  <td className={classes.num}>{f.signed(r.balance)}</td>
                </tr>
              ))}
              <tr className={classes.footRow}>
                <td colSpan={2}>
                  {t("bizTotal")}{" "}
                  <span className={data.balanced ? classes.statusOk : classes.statusBad}>
                    ({data.balanced ? t("bizIsBalanced") : t("bizNotBalanced")})
                  </span>
                </td>
                <td className={classes.num}>{f.money(data.totals.debit)}</td>
                <td className={classes.num}>{f.money(data.totals.credit)}</td>
                <td />
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </HandleLoading>
  );
};

const Section = ({ title, rows, total }: { title: string; rows: BizAccount[]; total: number }) => {
  const f = useBizFormat();
  const t = useBizText();
  return (
    <div className={classes.tableWrap}>
      <table className={classes.table}>
        <thead>
          <tr>
            <th>{title}</th>
            <th className={classes.num} />
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td colSpan={2} className={classes.muted}>
                {t("bizEmpty")}
              </td>
            </tr>
          )}
          {rows.map((r) => (
            <tr key={r._id}>
              <td className={classes.wrap}>{r.name}</td>
              <td className={classes.num}>{f.signed(r.balance ?? r.period)}</td>
            </tr>
          ))}
          <tr className={classes.footRow}>
            <td>{t("bizTotal")}</td>
            <td className={classes.num}>{f.signed(total)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

const IncomeStatement = ({ from, to, refreshKey }: { from: Date | null; to: Date | null; refreshKey: number }) => {
  const t = useBizText();
  const f = useBizFormat();
  const { data, error } = useReport<Income>("income-statement", from, to, refreshKey);
  // the period's figure, not the account's all-time balance
  const period = (rows: BizAccount[]) => asArray<BizAccount>(rows).map((r) => ({ ...r, balance: r.period }));
  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <div className={classes.main}>
          <div className={classes.statementGrid}>
            <Section title={t("bizIncome")} rows={period(data.income)} total={data.totalIncome} />
            <Section title={t("bizExpense")} rows={period(data.expenses)} total={data.totalExpense} />
          </div>
          <div className={`${classes.tile} ${classes.primaryTile}`}>
            <span className={classes.tileLabel}>{t("bizNetProfit")}</span>
            <span className={classes.tileValue}>
              {f.signed(data.net)}
              <span className={classes.tileUnit}>{t("toman")}</span>
            </span>
          </div>
        </div>
      )}
    </HandleLoading>
  );
};

const BalanceSheet = ({ to, refreshKey }: { to: Date | null; refreshKey: number }) => {
  const t = useBizText();
  const f = useBizFormat();
  const { data, error } = useReport<Sheet>("balance-sheet", null, to, refreshKey);
  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <div className={classes.main}>
          <div className={classes.statementGrid}>
            <Section title={t("bizAssets")} rows={asArray(data.assets)} total={data.totalAssets} />
            <div className={classes.main}>
              <Section title={t("bizLiabilities")} rows={asArray(data.liabilities)} total={data.totalLiabilities} />
              <Section
                title={t("bizEquity")}
                rows={[
                  ...asArray<BizAccount>(data.equity),
                  { _id: "profit", code: "", name: t("bizCurrentProfit"), type: "equity", level: "detail", pD: 0, pC: 0, before: 0, period: 0, balance: data.profit },
                ]}
                total={data.totalEquity}
              />
            </div>
          </div>
          <p className={data.balanced ? classes.statusOk : classes.statusBad}>
            {t("bizTotalAssets")}: {f.signed(data.totalAssets)} · {t("bizTotalLiabEquity")}:{" "}
            {f.signed(data.totalLiabilities + data.totalEquity)} · {data.balanced ? t("bizIsBalanced") : t("bizNotBalanced")}
          </p>
        </div>
      )}
    </HandleLoading>
  );
};


type CashSection = { key: "operating" | "investing" | "financing"; rows: { code: string; name: string; amount: number }[]; inflow: number; outflow: number; net: number };
type Cash = { opening: number; closing: number; net: number; sections: CashSection[]; balanced: boolean };
type Centers = { rows: { _id: string; name: string; isActive: boolean; income: number; expense: number; net: number }[] };

const flowTitle = { operating: "bizCashOperating", investing: "bizCashInvesting", financing: "bizCashFinancing" } as const;

// where cash (till, banks, the Noyan wallet) came from and went, direct
// method: each movement under the account on its other side
export const CashFlow = ({ from, to, refreshKey }: { from: Date | null; to: Date | null; refreshKey: number }) => {
  const t = useBizText();
  const f = useBizFormat();
  const { data, error } = useReport<Cash>("cash-flow", from, to, refreshKey);
  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <div className={classes.tableWrap}>
          <table className={classes.table}>
            <tbody>
              <tr className={classes.groupRow}>
                <td>{t("bizCashOpening")}</td>
                <td className={classes.num}>{f.signed(data.opening)}</td>
              </tr>
              {asArray<CashSection>(data.sections).map((sec) => (
                <Fragment key={sec.key}>
                  <tr className={classes.groupRow}>
                    <td>{t(flowTitle[sec.key])}</td>
                    <td className={classes.num} />
                  </tr>
                  {sec.rows.length === 0 ? (
                    <tr>
                      <td className={classes.muted}>{t("bizNoMovement")}</td>
                      <td />
                    </tr>
                  ) : (
                    sec.rows.map((r) => (
                      <tr key={r.code}>
                        <td className={`${classes.wrap} ${classes.indent}`}>
                          {r.amount >= 0 ? t("bizCashFrom", [r.name]) : t("bizCashFor", [r.name])}
                        </td>
                        <td className={`${classes.num} ${r.amount < 0 ? classes.negative : ""}`}>{f.signed(r.amount)}</td>
                      </tr>
                    ))
                  )}
                  <tr className={classes.totalRow}>
                    <td>{t("bizCashNetOf", [t(flowTitle[sec.key])])}</td>
                    <td className={`${classes.num} ${sec.net < 0 ? classes.negative : ""}`}>{f.signed(sec.net)}</td>
                  </tr>
                </Fragment>
              ))}
              <tr className={classes.totalRow}>
                <td>{t("bizCashNet")}</td>
                <td className={`${classes.num} ${data.net < 0 ? classes.negative : ""}`}>{f.signed(data.net)}</td>
              </tr>
              <tr className={classes.groupRow}>
                <td>{t("bizCashClosing")}</td>
                <td className={classes.num}>{f.signed(data.closing)}</td>
              </tr>
            </tbody>
          </table>
          {!data.balanced && <p className={classes.statusBad}>{t("bizCashMismatch")}</p>}
        </div>
      )}
    </HandleLoading>
  );
};

// income and expense of each cost centre, and of what was booked to none
export const CostCenters = ({ from, to, refreshKey }: { from: Date | null; to: Date | null; refreshKey: number }) => {
  const t = useBizText();
  const f = useBizFormat();
  const { data, error } = useReport<Centers>("cost-centers", from, to, refreshKey);
  const rows = asArray<Centers["rows"][number]>(data?.rows).filter((r) => r._id || r.income || r.expense);
  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <>
          <p className={classes.muted}>{t("bizCentersHint")}</p>
          <div className={classes.tableWrap}>
            <table className={classes.table}>
              <thead>
                <tr>
                  <th>{t("bizCostCenter")}</th>
                  <th className={classes.num}>{t("bizIncome")}</th>
                  <th className={classes.num}>{t("bizExpense")}</th>
                  <th className={classes.num}>{t("bizNetProfit")}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r._id || "none"}>
                    <td className={classes.wrap}>
                      {r._id ? r.name : <span className={classes.muted}>{t("bizNoCostCenter")}</span>}
                    </td>
                    <td className={classes.num}>{f.money(r.income)}</td>
                    <td className={classes.num}>{f.money(r.expense)}</td>
                    <td className={`${classes.num} ${r.net < 0 ? classes.negative : ""}`}>{f.signed(r.net)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </HandleLoading>
  );
};

const AccountingReports = ({ refreshKey }: { refreshKey: number }) => {
  const t = useBizText();
  const [report, setReport] = useState<"trial" | "income" | "sheet" | "cash" | "centers">("income");
  const [from, setFrom] = useState<Date | null>(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [to, setTo] = useState<Date | null>(null);
  return (
    <section className={classes.card}>
      <div className={classes.cardHead}>
        <div className={classes.segmented} role="tablist">
          {(
            [
              ["income", "bizIncomeStatement"],
              ["sheet", "bizBalanceSheet"],
              ["cash", "bizCashFlow"],
              ["centers", "bizCostCenters"],
              ["trial", "bizTrialBalance"],
            ] as const
          ).map(([k, label]) => (
            <button key={k} type="button" className={report === k ? classes.on : ""} onClick={() => setReport(k)}>
              {t(label)}
            </button>
          ))}
        </div>
      </div>
      <div className={classes.form}>
        {report !== "sheet" && (
          <div className={classes.field}>
            <DateInput title={t("bizFrom")} defaultValue={from || undefined} onChange={(d) => setFrom(d)} />
          </div>
        )}
        <div className={classes.field}>
          <DateInput title={t("bizTo")} defaultValue={to || undefined} onChange={(d) => setTo(d)} />
        </div>
      </div>
      {report === "trial" && <TrialBalance from={from} to={to} refreshKey={refreshKey} />}
      {report === "income" && <IncomeStatement from={from} to={to} refreshKey={refreshKey} />}
      {report === "sheet" && <BalanceSheet to={to} refreshKey={refreshKey} />}
      {report === "cash" && <CashFlow from={from} to={to} refreshKey={refreshKey} />}
      {report === "centers" && <CostCenters from={from} to={to} refreshKey={refreshKey} />}
    </section>
  );
};

export default AccountingReports;
