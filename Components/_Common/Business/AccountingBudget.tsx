"use client";

import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import useNotification from "@/Components/Hooks/useNotification";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import classes from "./Accounting.module.css";
import { useIntlLocale } from "@/Components/i18n/navigation";
import { asArray, useBiz, useBizFormat, useBizText } from "./bizShared";

type Line = {
  _id: string;
  code: string;
  name: string;
  type: "income" | "expense";
  budget: number;
  budgetToDate: number;
  actual: number;
  variance: number;
};
type Totals = { budget: number; budgetToDate: number; actual: number };
type Budget = { year: number; months: number; lines: Line[]; totals: { income: Totals; expense: Totals } };

const digits = (s: string) =>
  Number(s.replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d))).replace(/[^\d.]/g, "")) || 0;

// The tehran-time Jalali year of today, from the browser's own calendar
const currentYear = () => Number(new Intl.DateTimeFormat("en-u-ca-persian", { year: "numeric", timeZone: "Asia/Tehran" }).format(new Date()).replace(/\D/g, ""));

// A Jalali year's budget (2026-10, docs/business-suite.md phase 6): an
// annual amount for each income and expense account, compared with what
// happened so far - the budget spread evenly over the months gone by.
const AccountingBudget = ({ refreshKey }: { refreshKey: number }) => {
  const t = useBizText();
  const f = useBizFormat();
  const tag = useIntlLocale();
  const pct = new Intl.NumberFormat(tag, { style: "percent", maximumFractionDigits: 0 });
  const { api, canWrite } = useBiz();
  const pushNotification = useNotification();
  const [year, setYear] = useState(currentYear);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const { data, error, mutate } = useSWR<Budget | null>(`${API}${api}/budget?year=${year}`, (url: string) =>
    fetcher({ url }).then((res) => (res?.data && typeof res.data === "object" ? (res.data as Budget) : null)),
  );
  useEffect(() => {
    mutate();
  }, [refreshKey, mutate]);
  useEffect(() => {
    setDraft(Object.fromEntries(asArray<Line>(data?.lines).map((l) => [l._id, l.budget ? String(l.budget) : ""])));
  }, [data]);
  const lines = asArray<Line>(data?.lines);
  const dirty = useMemo(() => lines.some((l) => digits(draft[l._id] || "") !== l.budget), [lines, draft]);

  const save = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await fetcher({
        url: `${API}${api}/budget/${year}`,
        method: "PUT",
        payload: { lines: lines.map((l) => ({ account: l._id, amount: digits(draft[l._id] || "") })).filter((l) => l.amount > 0) },
      });
      pushNotification(t("bizSaved"), "Success");
      await mutate();
    } catch (err) {
      pushNotification((err as Error)?.message || String(err), "Error");
    } finally {
      setBusy(false);
    }
  };

  const section = (type: "income" | "expense") => {
    const rows = lines.filter((l) => l.type === type && (showAll || l.budget || l.actual || draft[l._id]));
    const tot = data?.totals[type];
    return (
      <>
        <tr className={classes.groupRow}>
          <td colSpan={5}>{t(type === "income" ? "bizIncome" : "bizExpense")}</td>
        </tr>
        {rows.map((l) => {
          const used = l.budget ? l.actual / l.budget : 0;
          return (
            <tr key={l._id}>
              <td className={classes.wrap}>
                {l.code} · {l.name}
              </td>
              <td className={classes.num}>
                {canWrite ? (
                  <input
                    className={classes.budgetInput}
                    inputMode="numeric"
                    dir="ltr"
                    value={draft[l._id] || ""}
                    aria-label={t("bizBudgetAnnual")}
                    onChange={(e) => setDraft((d) => ({ ...d, [l._id]: e.target.value }))}
                  />
                ) : (
                  f.money(l.budget)
                )}
              </td>
              <td className={classes.num}>{l.budget ? f.money(l.budgetToDate) : "—"}</td>
              <td className={classes.num}>
                {f.money(l.actual)}
                {l.budget ? <span className={classes.muted}> ({pct.format(used)})</span> : null}
              </td>
              <td className={`${classes.num} ${l.budget && l.variance < 0 ? classes.negative : ""}`}>{l.budget ? f.signed(l.variance) : "—"}</td>
            </tr>
          );
        })}
        {!!tot && (
          <tr className={classes.totalRow}>
            <td>{t(type === "income" ? "bizTotalIncome" : "bizTotalExpense")}</td>
            <td className={classes.num}>{f.money(tot.budget)}</td>
            <td className={classes.num}>{f.money(tot.budgetToDate)}</td>
            <td className={classes.num}>{f.money(tot.actual)}</td>
            <td />
          </tr>
        )}
      </>
    );
  };

  return (
    <section className={classes.card}>
      <div className={classes.cardHead}>
        <span className={classes.cardTitle}>{t("bizBudgetTitle", [f.year(year)])}</span>
        <div className={classes.segmented}>
          {[year - 1, year, year + 1].map((y) => (
            <button key={y} type="button" className={y === year ? classes.on : ""} onClick={() => setYear(y)}>
              {f.year(y)}
            </button>
          ))}
        </div>
      </div>
      <p className={classes.muted}>{t("bizBudgetHint", [f.money(Math.floor(data?.months || 0))])}</p>
      <HandleLoading data={data !== undefined} error={error}>
        <div className={classes.tableWrap}>
          <table className={classes.table}>
            <thead>
              <tr>
                <th>{t("bizAccount")}</th>
                <th className={classes.num}>{t("bizBudgetAnnual")}</th>
                <th className={classes.num}>{t("bizBudgetToDate")}</th>
                <th className={classes.num}>{t("bizBudgetActual")}</th>
                <th className={classes.num}>{t("bizBudgetVariance")}</th>
              </tr>
            </thead>
            <tbody>
              {section("income")}
              {section("expense")}
            </tbody>
          </table>
        </div>
      </HandleLoading>
      <div className={classes.actions}>
        <button type="button" className={classes.ghost} onClick={() => setShowAll((v) => !v)}>
          {t(showAll ? "bizBudgetUsedOnly" : "bizBudgetAllAccounts")}
        </button>
        {canWrite && (
          <button type="button" className={classes.primary} disabled={busy || !dirty} onClick={save}>
            {t("bizSave")}
          </button>
        )}
      </div>
    </section>
  );
};

export default AccountingBudget;
