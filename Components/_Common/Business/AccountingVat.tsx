"use client";

import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import useNotification from "@/Components/Hooks/useNotification";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import DateInput from "@/Components/UI/DateInput";
import { useIntlLocale } from "@/Components/i18n/navigation";
import { ContentKey } from "@/Components/Enums/contentKeys";
import classes from "./Accounting.module.css";
import { BizAccount, asArray, isoDay, useBiz, useBizFormat, useBizText } from "./bizShared";

type Bucket = { count: number; base: number; vat: number };
type Quarter = { quarter: number; start: string; end: string; due: string; ended: boolean; settled: boolean; payable?: number; credit?: number; paidAt?: string; canReopen: boolean };
type Vat = {
  year: number;
  quarter: number;
  start: string;
  end: string;
  due: string;
  ended: boolean;
  sales: { byRate: { rate: number; base: number; vat: number }[]; taxable: number; exempt: number; vat: number; registered: number; pending: number; rejected: number };
  purchases: { withCode: Bucket; withoutCode: Bucket };
  books: { output: number; input: number; creditable: number; nonCreditable: number };
  unpaidBefore: number;
  figures: { output: number; creditable: number; nonCreditable: number; carried: number; offset: number; payable: number; credit: number };
  gap: number;
  settled: { settledAt: string; paidAt?: string } | null;
  blockers: string[];
  quarters: Quarter[];
  current: { year: number; quarter: number };
};

const SEASON: Record<number, ContentKey> = { 1: "bizVatQ1", 2: "bizVatQ2", 3: "bizVatQ3", 4: "bizVatQ4" };

// The quarterly VAT return (2026-10, Lib/business/vatReturn.ts): the
// quarter's sales from Moadian by rate, purchases with and without the
// supplier's economic code, and the result. Settling the quarter offsets
// output against input in the books; what is left is paid to the tax
// office or carried as credit to the next quarter.
const AccountingVat = ({ refreshKey, onChanged }: { refreshKey: number; onChanged: () => unknown }) => {
  const t = useBizText();
  const f = useBizFormat();
  const tag = useIntlLocale();
  const pct = useMemo(() => new Intl.NumberFormat(tag, { style: "percent", maximumFractionDigits: 2 }), [tag]);
  const { api, canWrite } = useBiz();
  const pushNotification = useNotification();
  const [pick, setPick] = useState<{ year?: number; quarter?: number }>({});
  const [busy, setBusy] = useState(false);
  const [via, setVia] = useState("");
  const [payDate, setPayDate] = useState<Date>(new Date());
  const query = pick.year ? `?year=${pick.year}&quarter=${pick.quarter || 4}` : "";
  const { data, error, mutate } = useSWR<Vat | null>(`${API}${api}/vat${query}`, (url: string) =>
    fetcher({ url }).then((res) => (res?.data && typeof res.data === "object" ? (res.data as Vat) : null)),
  );
  const { data: accounts } = useSWR<BizAccount[]>(`${API}${api}/accounts`, (url: string) =>
    fetcher({ url }).then((res) => asArray<BizAccount>(res.data)),
  );
  useEffect(() => {
    mutate();
  }, [refreshKey, mutate]);

  const cash = asArray<BizAccount>(accounts).filter(
    (a) => a.type === "asset" && a.level === "detail" && (["cash", "bank", "noyanWallet"].includes(a.role || "") || (a.parentCode === "11" && !a.role)),
  );
  const year = data?.year || pick.year;
  const years = data ? [data.current.year - 2, data.current.year - 1, data.current.year] : [];

  const act = async (what: "settle" | "reopen" | "pay") => {
    if (!data || busy) return;
    const season = t(SEASON[data.quarter]);
    if (what === "settle" && !window.confirm(t("bizVatSettleConfirm", [`${season} ${f.year(data.year)}`]))) return;
    if (what === "reopen" && !window.confirm(t("bizVatReopenConfirm"))) return;
    setBusy(true);
    try {
      await fetcher({
        url: `${API}${api}/vat/${data.year}/${data.quarter}/${what}`,
        method: "POST",
        ...(what === "pay" ? { payload: { via, date: isoDay(payDate) } } : {}),
      });
      pushNotification(t(what === "settle" ? "bizVatSettled" : what === "reopen" ? "bizVatReopened" : "bizVatPaid"), "Success");
      await mutate();
      onChanged();
    } catch (err) {
      pushNotification((err as Error)?.message || String(err), "Error");
    } finally {
      setBusy(false);
    }
  };

  const q = data?.quarters.find((x) => x.quarter === data.quarter);
  const fig = data?.figures;
  return (
    <div className={classes.main}>
      <section className={classes.card}>
        <div className={classes.cardHead}>
          <span className={classes.cardTitle}>{t("bizVatTitle")}</span>
          {!!data && (
            <label className={classes.filters}>
              <select value={year} onChange={(e) => setPick({ year: Number(e.target.value), quarter: 1 })} aria-label={t("bizFiscalYearCol")}>
                {years.map((y) => (
                  <option key={y} value={y}>
                    {f.year(y)}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>
        <p className={classes.muted}>{t("bizVatHint")}</p>
        {!!data && (
          <div className={classes.segmented} role="tablist">
            {asArray<Quarter>(data.quarters).map((x) => (
              <button
                key={x.quarter}
                type="button"
                role="tab"
                aria-selected={x.quarter === data.quarter}
                className={x.quarter === data.quarter ? classes.on : ""}
                onClick={() => setPick({ year: data.year, quarter: x.quarter })}
              >
                {t(SEASON[x.quarter])}
                {x.settled && (
                  <span
                    className={`${classes.stateDot} ${x.paidAt ? classes.stateDotDone : ""}`}
                    role="img"
                    aria-label={t(x.paidAt ? "bizVatStPaid" : "bizVatStSettled")}
                    title={t(x.paidAt ? "bizVatStPaid" : "bizVatStSettled")}
                  />
                )}
              </button>
            ))}
          </div>
        )}
      </section>
      <HandleLoading data={data !== undefined} error={error}>
        {!!data && !!fig && (
          <>
            <section className={classes.card}>
              <span className={classes.cardTitle}>
                {t(SEASON[data.quarter])} {f.year(data.year)}
              </span>
              <p className={classes.muted}>
                {f.tehranDate(data.start)} – {f.tehranDate(data.end)} · {t("bizVatDue", [f.tehranDate(data.due)])}
              </p>
              {(data.sales.pending > 0 || data.sales.rejected > 0 || Math.abs(data.gap) >= 1 || data.unpaidBefore > 0) && (
                <ul className={classes.warnings}>
                  {data.sales.pending > 0 && <li>{t("bizVatPendingInv", [f.money(data.sales.pending)])}</li>}
                  {data.sales.rejected > 0 && <li>{t("bizVatRejectedInv", [f.money(data.sales.rejected)])}</li>}
                  {Math.abs(data.gap) >= 1 && <li>{t("bizVatGap", [f.money(Math.abs(data.gap))])}</li>}
                  {data.unpaidBefore > 0 && <li>{t("bizVatUnpaid", [f.money(data.unpaidBefore)])}</li>}
                </ul>
              )}
            </section>

            <section className={classes.card}>
              <span className={classes.cardTitle}>{t("bizVatSales")}</span>
              {data.sales.byRate.length ? (
                <div className={classes.tableWrap}>
                  <table className={classes.table}>
                    <thead>
                      <tr>
                        <th>{t("bizVatRate")}</th>
                        <th className={classes.num}>{t("bizVatBase")}</th>
                        <th className={classes.num}>{t("bizVatAmount")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.sales.byRate.map((r) => (
                        <tr key={r.rate}>
                          <td>{r.rate > 0 ? pct.format(r.rate / 100) : t("bizVatExempt")}</td>
                          <td className={classes.num}>{f.signed(r.base)}</td>
                          <td className={classes.num}>{f.signed(r.vat)}</td>
                        </tr>
                      ))}
                      <tr className={classes.groupRow}>
                        <td>{t("bizTotal")}</td>
                        <td className={classes.num}>{f.signed(data.sales.taxable + data.sales.exempt)}</td>
                        <td className={classes.num}>{f.signed(data.sales.vat)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className={classes.empty}>{t("bizVatNoSales")}</p>
              )}
            </section>

            <section className={classes.card}>
              <span className={classes.cardTitle}>{t("bizVatPurchases")}</span>
              <div className={classes.tableWrap}>
                <table className={classes.table}>
                  <thead>
                    <tr>
                      <th />
                      <th className={classes.num}>{t("bizVatCount")}</th>
                      <th className={classes.num}>{t("bizVatBase")}</th>
                      <th className={classes.num}>{t("bizVatAmount")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(["withCode", "withoutCode"] as const).map((k) => (
                      <tr key={k}>
                        <td>{t(k === "withCode" ? "bizVatWithCode" : "bizVatWithoutCode")}</td>
                        <td className={classes.num}>{f.money(data.purchases[k].count)}</td>
                        <td className={classes.num}>{f.money(data.purchases[k].base)}</td>
                        <td className={classes.num}>{f.money(data.purchases[k].vat)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className={classes.card}>
              <span className={classes.cardTitle}>{t("bizVatResult")}</span>
              <div className={classes.tiles}>
                {(
                  [
                    ["bizVatOutput", fig.output],
                    ["bizVatCreditable", fig.creditable],
                    ["bizVatCarried", fig.carried],
                    ["bizVatNonCreditable", fig.nonCreditable],
                  ] as [ContentKey, number][]
                ).map(([k, v]) => (
                  <div key={k} className={classes.tile}>
                    <span className={classes.tileLabel}>{t(k)}</span>
                    <span className={classes.tileValue}>{f.money(v)}</span>
                  </div>
                ))}
                <div className={`${classes.tile} ${classes.primaryTile}`}>
                  <span className={classes.tileLabel}>{t(fig.payable > 0 ? "bizVatPayable" : "bizVatCredit")}</span>
                  <span className={classes.tileValue}>{f.money(fig.payable > 0 ? fig.payable : fig.credit)}</span>
                </div>
              </div>
              {data.blockers.length > 0 && !data.settled && (
                <ul className={classes.blockers}>
                  {data.blockers.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              )}
              {data.settled?.paidAt && <p className={classes.muted}>{t("bizVatPaidOn", [f.date(data.settled.paidAt)])}</p>}
              {canWrite && (
                <>
                  {!data.settled && (
                    <div className={classes.actions}>
                      <button type="button" className={classes.primary} disabled={busy || data.blockers.length > 0} onClick={() => act("settle")}>
                        {t("bizVatSettle")}
                      </button>
                    </div>
                  )}
                  {!!data.settled && !data.settled.paidAt && fig.payable > 0 && (
                    <div className={classes.form}>
                      <label className={classes.field}>
                        {t("bizVatPayFrom")}
                        <select value={via} onChange={(e) => setVia(e.target.value)}>
                          <option value="">{t("bizSelect")}</option>
                          {cash.map((a) => (
                            <option key={a._id} value={a._id}>
                              {a.name}
                            </option>
                          ))}
                        </select>
                      </label>
                      <div className={classes.field}>
                        <DateInput title={t("bizDate")} defaultValue={payDate} onChange={(d) => setPayDate(d)} />
                      </div>
                      <div className={classes.actions}>
                        <button type="button" className={classes.primary} disabled={busy || !via} onClick={() => act("pay")}>
                          {t("bizVatPay")}
                        </button>
                      </div>
                    </div>
                  )}
                  {q?.canReopen && (
                    <div className={classes.actions}>
                      <button type="button" className={classes.ghost} disabled={busy} onClick={() => act("reopen")}>
                        {t("bizVatReopen")}
                      </button>
                    </div>
                  )}
                </>
              )}
            </section>
          </>
        )}
      </HandleLoading>
    </div>
  );
};

export default AccountingVat;
