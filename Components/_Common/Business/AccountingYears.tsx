"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import useNotification from "@/Components/Hooks/useNotification";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import classes from "./Accounting.module.css";
import { asArray, useBiz, useBizFormat, useBizText } from "./bizShared";

type Year = {
  year: number;
  start: string;
  end: string;
  ended: boolean;
  closed: boolean;
  closedAt?: string;
  profit?: number;
  vouchers: number;
  canReopen: boolean;
};

type Next = {
  year: number;
  blockers: string[];
  warnings: { code: "payrollDraft" | "purchaseDraft"; count: number }[];
  manual: number;
  balanced: boolean;
};

type Years = { years: Year[]; next: Next | null };

// Year-end close (2026-10, docs/business-suite.md phase 6): the Jalali
// fiscal years of these books, and closing the oldest one that ended - its
// income and expenses into retained earnings, the اختتامیه and the
// افتتاحیه of the next year. A closed year is locked; the latest one can be
// opened again.
const AccountingYears = ({ refreshKey, onChanged }: { refreshKey: number; onChanged: () => unknown }) => {
  const t = useBizText();
  const f = useBizFormat();
  const { api, canWrite } = useBiz();
  const pushNotification = useNotification();
  const [busy, setBusy] = useState(false);
  const { data, error, mutate } = useSWR<Years | null>(`${API}${api}/years`, (url: string) =>
    fetcher({ url }).then((res) => (res?.data && typeof res.data === "object" ? (res.data as Years) : null)),
  );
  useEffect(() => {
    mutate();
  }, [refreshKey, mutate]);

  const act = async (year: number, what: "close" | "reopen") => {
    if (busy) return;
    const ask = what === "close" ? t("bizCloseConfirm", [f.year(year)]) : t("bizReopenConfirm", [f.year(year)]);
    if (!window.confirm(ask)) return;
    setBusy(true);
    try {
      await fetcher({ url: `${API}${api}/years/${year}/${what}`, method: "POST" });
      pushNotification(t(what === "close" ? "bizYearClosed" : "bizYearReopened", [f.year(year)]), "Success");
      await mutate();
      onChanged();
    } catch (err) {
      pushNotification((err as Error)?.message || String(err), "Error");
    } finally {
      setBusy(false);
    }
  };

  const next = data?.next;
  const years = asArray<Year>(data?.years);
  return (
    <HandleLoading data={data !== undefined} error={error}>
      <div className={classes.main}>
        <section className={classes.card}>
          <span className={classes.cardTitle}>{t("bizYearsTitle")}</span>
          <p className={classes.muted}>{t("bizYearsHint")}</p>
          {next ? (
            <div className={classes.closeBox}>
              <span className={classes.cardTitle}>{t("bizNextClose", [f.year(next.year)])}</span>
              <ol className={classes.closeSteps}>
                <li>{t("bizCloseStep1")}</li>
                <li>{t("bizCloseStep2")}</li>
                <li>{t("bizCloseStep3", [f.year(next.year + 1)])}</li>
              </ol>
              {next.blockers.length > 0 && (
                <ul className={classes.blockers}>
                  {next.blockers.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              )}
              {next.warnings.length > 0 && (
                <ul className={classes.warnings}>
                  {next.warnings.map((w) => (
                    <li key={w.code}>{t(w.code === "payrollDraft" ? "bizWarnPayroll" : "bizWarnPurchase", [f.money(w.count)])}</li>
                  ))}
                </ul>
              )}
              <p className={classes.muted}>{t("bizCloseLockNote")}</p>
              {canWrite && (
                <div className={classes.actions}>
                  <button type="button" className={classes.primary} disabled={busy || next.blockers.length > 0} onClick={() => act(next.year, "close")}>
                    {t("bizCloseYear", [f.year(next.year)])}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <p className={classes.empty}>{t("bizNothingToClose")}</p>
          )}
        </section>
        <section className={classes.card}>
          <div className={classes.tableWrap}>
            <table className={classes.table}>
              <thead>
                <tr>
                  <th>{t("bizFiscalYearCol")}</th>
                  <th>{t("bizPeriod")}</th>
                  <th>{t("status")}</th>
                  <th className={classes.num}>{t("bizVoucherCount")}</th>
                  <th className={classes.num}>{t("bizYearProfit")}</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {years.map((y) => (
                  <tr key={y.year}>
                    <td>{f.year(y.year)}</td>
                    <td>
                      {f.tehranDate(y.start)} – {f.tehranDate(y.end)}
                    </td>
                    <td>
                      <span className={`${classes.badge} ${y.closed ? classes.badgeManual : y.ended ? classes.badgeAuto : ""}`}>
                        {t(y.closed ? "bizYearStClosed" : y.ended ? "bizYearStEnded" : "bizYearStOpen")}
                      </span>
                      {y.closed && y.closedAt ? <span className={classes.muted}> · {f.date(y.closedAt)}</span> : null}
                    </td>
                    <td className={classes.num}>{f.money(y.vouchers)}</td>
                    <td className={`${classes.num} ${(y.profit || 0) < 0 ? classes.negative : ""}`}>{y.closed ? f.signed(y.profit) : "—"}</td>
                    <td>
                      {canWrite && y.canReopen && (
                        <button type="button" className={classes.ghost} disabled={busy} onClick={() => act(y.year, "reopen")}>
                          {t("bizReopenYear")}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </HandleLoading>
  );
};

export default AccountingYears;
