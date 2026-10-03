"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import useNotification from "@/Components/Hooks/useNotification";
import usePopup from "@/Components/Hooks/usePopup";
import { useIntlLocale } from "@/Components/i18n/navigation";
import PopupCard from "@/Components/UI/PopupCard";
import PayrollDisk from "./PayrollDisk";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import DateInput from "@/Components/UI/DateInput";
import classes from "../Accounting.module.css";
import pay from "./Payroll.module.css";
import { asArray, isoDay, useBizFormat } from "../bizShared";
import { PayContext, PayRun, PaySlip, toNum, useJalaliMonth, usePay, usePayAccounts, usePayText } from "./payShared";

type Ctx = React.ContextType<typeof PayContext>;
type Row = { employee: string; workedDays: string; overtimeHours: string; otherEarnings: string; deductions: string };

const rowOf = (s: PaySlip): Row => ({
  employee: String(s.employee),
  workedDays: String(s.workedDays),
  overtimeHours: s.overtimeHours ? String(s.overtimeHours) : "",
  otherEarnings: s.otherEarnings ? String(s.otherEarnings) : "",
  deductions: s.deductions ? String(s.deductions) : "",
});

// One employee's payslip, printable: the page prints only this sheet.
const Payslip = ({ run, slip }: { run: PayRun; slip: PaySlip }) => {
  const t = usePayText();
  const f = useBizFormat();
  const jm = useJalaliMonth();
  useEffect(() => () => document.body.classList.remove("printingSlip"), []);
  const print = () => {
    document.body.classList.add("printingSlip");
    window.print();
    document.body.classList.remove("printingSlip");
  };
  const line = (label: string, value: number) =>
    value ? (
      <tr>
        <td>{label}</td>
        <td className={classes.num}>{f.money(value)}</td>
      </tr>
    ) : null;
  return (
    <PopupCard size="wide" title={t("paySlipTitle")}>
      <div className={classes.popup}>
        <div className={`printSlip ${pay.slip}`}>
          <div className={classes.cardHead}>
            <span className={classes.cardTitle}>{slip.name}</span>
            <span className={classes.muted}>{jm.label(run)}</span>
          </div>
          <p className={classes.muted}>
            {[slip.position, slip.nationalId && `${t("payNationalId")}: ${slip.nationalId}`, slip.insuranceNo && `${t("payInsuranceNo")}: ${slip.insuranceNo}`]
              .filter(Boolean)
              .join(" · ")}
          </p>
          <div className={classes.statementGrid}>
            <table className={classes.table}>
              <thead>
                <tr>
                  <th>{t("payEarnings")}</th>
                  <th className={classes.num} />
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{t("payBase", [f.money(slip.workedDays)])}</td>
                  <td className={classes.num}>{f.money(slip.base)}</td>
                </tr>
                {line(t("payHousing"), slip.housing)}
                {line(t("payFood"), slip.food)}
                {line(t("payChild"), slip.child)}
                {line(t("payOvertime"), slip.overtime)}
                {line(t("payOtherEarnings"), slip.otherEarnings)}
                <tr className={classes.footRow}>
                  <td>{t("payGross")}</td>
                  <td className={classes.num}>{f.money(slip.gross)}</td>
                </tr>
              </tbody>
            </table>
            <table className={classes.table}>
              <thead>
                <tr>
                  <th>{t("payDeductionsTitle")}</th>
                  <th className={classes.num} />
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{t("payInsuranceEmployee")}</td>
                  <td className={classes.num}>{f.money(slip.insuranceEmployee)}</td>
                </tr>
                <tr>
                  <td>{t("payTax")}</td>
                  <td className={classes.num}>{f.money(slip.tax)}</td>
                </tr>
                {line(t("payDeductions"), slip.deductions)}
                <tr className={classes.footRow}>
                  <td>{t("payTotalDeductions")}</td>
                  <td className={classes.num}>{f.money(slip.insuranceEmployee + slip.tax + slip.deductions)}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className={`${classes.tile} ${classes.primaryTile}`}>
            <span className={classes.tileLabel}>{t("payNet")}</span>
            <span className={classes.tileValue}>
              {f.money(slip.net)}
              <span className={classes.tileUnit}>{t("toman")}</span>
            </span>
          </div>
          <p className={classes.muted}>
            {t("payInsuranceBase")}: {f.money(slip.insuranceBase)} · {t("payInsuranceEmployer")}: {f.money(slip.insuranceEmployer)} ·{" "}
            {t("payTaxableBase")}: {f.money(slip.taxableBase)}
          </p>
        </div>
        <div className={classes.actions}>
          <button type="button" className={classes.primary} onClick={print}>
            {t("payPrint")}
          </button>
        </div>
      </div>
    </PopupCard>
  );
};

const PayForm = ({ run, onDone }: { run: PayRun; onDone: () => unknown }) => {
  const t = usePayText();
  const f = useBizFormat();
  const { api } = usePay();
  const pushNotification = useNotification();
  const { data: accounts } = usePayAccounts();
  const [what, setWhat] = useState<"salaries" | "liabilities">(run.salariesPaidAt ? "liabilities" : "salaries");
  const [via, setVia] = useState("");
  const [date, setDate] = useState<Date>(new Date());
  const [busy, setBusy] = useState(false);
  const options = (["salaries", "liabilities"] as const).filter((w) => !(w === "salaries" ? run.salariesPaidAt : run.liabilitiesPaidAt));
  if (!options.length) return null;
  const current = options.includes(what) ? what : options[0];
  const amount =
    current === "salaries" ? run.totals.net : run.totals.insuranceEmployee + run.totals.insuranceEmployer + run.totals.tax;
  const save = async () => {
    if (busy || !via) return;
    setBusy(true);
    try {
      await fetcher({ url: `${API}${api}/runs/${run._id}/pay`, method: "POST", payload: { what: current, via, date: isoDay(date) } });
      pushNotification(t("bizSaved"), "Success");
      onDone();
    } catch (err) {
      pushNotification((err as Error)?.message || String(err), "Error");
    } finally {
      setBusy(false);
    }
  };
  return (
    <section className={pay.subCard}>
      <div className={classes.cardHead}>
        <span className={classes.cardTitle}>{t("payRecordPayment")}</span>
        {options.length > 1 && (
          <div className={classes.segmented} role="tablist">
            {options.map((w) => (
              <button key={w} type="button" className={current === w ? classes.on : ""} onClick={() => setWhat(w)}>
                {t(w === "salaries" ? "payPaySalaries" : "payPayLiabilities")}
              </button>
            ))}
          </div>
        )}
      </div>
      <p className={classes.muted}>
        {t(current === "salaries" ? "payPaySalariesHint" : "payPayLiabilitiesHint")} {t("bizAmount")}: <strong>{f.money(amount)}</strong>
      </p>
      <div className={classes.form}>
        <label className={classes.field}>
          {t("payPayFrom")}
          <select value={via} onChange={(e) => setVia(e.target.value)}>
            <option value="">{t("bizSelect")}</option>
            {asArray<{ _id: string; name: string }>(accounts).map((a) => (
              <option key={a._id} value={a._id}>
                {a.name}
              </option>
            ))}
          </select>
        </label>
        <div className={classes.field}>
          <DateInput title={t("bizDate")} defaultValue={date} onChange={(d) => setDate(d)} />
        </div>
        <div className={classes.actions}>
          <button type="button" className={classes.primary} disabled={busy || !via} onClick={save}>
            {t(current === "salaries" ? "payPaySalaries" : "payPayLiabilities")}
          </button>
        </div>
      </div>
    </section>
  );
};

// One month: the slips (inputs editable while a draft), the totals, post,
// pay, reopen.
const RunDetail = ({ ctx, id, onChanged }: { ctx: Ctx; id: string; onChanged: () => unknown }) => {
  const t = usePayText();
  const f = useBizFormat();
  const jm = useJalaliMonth();
  const { setPopup, closePopup } = usePopup();
  const pushNotification = useNotification();
  const { data, error, mutate } = useSWR<PayRun>(`${API}${ctx.api}/runs/${id}`, (url: string) =>
    fetcher({ url }).then((res) => res.data as PayRun),
  );
  const [rows, setRows] = useState<Row[] | null>(null);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState<"" | "post" | "reopen">("");
  useEffect(() => {
    if (data && !dirty) setRows(asArray<PaySlip>(data.slips).map(rowOf));
  }, [data, dirty]);
  const draft = data?.status === "draft";
  const editable = ctx.canWrite && draft;
  const set = (i: number, patch: Partial<Row>) => {
    setDirty(true);
    setRows((prev) => (prev ? prev.map((r, j) => (j === i ? { ...r, ...patch } : r)) : prev));
  };
  const changed = () => {
    mutate();
    onChanged();
  };
  const call = async (fn: () => Promise<unknown>, ok: string) => {
    if (busy) return false;
    setBusy(true);
    try {
      await fn();
      pushNotification(ok, "Success");
      return true;
    } catch (err) {
      pushNotification((err as Error)?.message || String(err), "Error");
      return false;
    } finally {
      setBusy(false);
    }
  };
  const save = () =>
    call(async () => {
      await fetcher({
        url: `${API}${ctx.api}/runs/${id}`,
        method: "PATCH",
        payload: {
          slips: (rows || []).map((r) => ({
            employee: r.employee,
            workedDays: toNum(r.workedDays),
            overtimeHours: toNum(r.overtimeHours),
            otherEarnings: toNum(r.otherEarnings),
            deductions: toNum(r.deductions),
          })),
        },
      });
      setDirty(false);
      changed();
    }, t("payRecomputed"));
  const post = async () => {
    if (dirty && !(await save())) return;
    const ok = await call(() => fetcher({ url: `${API}${ctx.api}/runs/${id}/post`, method: "POST" }), t("payPosted"));
    if (ok) {
      setConfirm("");
      changed();
    }
  };
  const reopen = async () => {
    const ok = await call(() => fetcher({ url: `${API}${ctx.api}/runs/${id}/reopen`, method: "POST" }), t(draft ? "payDeleted" : "payReopened"));
    if (!ok) return;
    setConfirm("");
    if (draft) {
      closePopup("PayRunDetail");
      onChanged();
    } else changed();
  };
  const slips = asArray<PaySlip>(data?.slips);
  const T = data?.totals;
  const openSlip = (s: PaySlip) =>
    data &&
    setPopup(
      "PaySlip",
      <PayContext.Provider value={ctx}>
        <Payslip run={data} slip={s} />
      </PayContext.Provider>,
    );

  return (
    <PopupCard size="wide" title={data ? t("payRunTitle", [jm.label(data)]) : t("payTabRuns")}>
      <div className={`${classes.popup} ${pay.widePopup}`}>
        <HandleLoading data={!!data && !!rows} error={error}>
          {!!data && !!rows && !!T && (
            <>
              <div className={classes.cardHead}>
                <span className={`${classes.badge} ${data.status === "posted" ? pay.badgeOk : classes.badgeManual}`}>
                  {t(data.status === "posted" ? "payStatusPosted" : "payStatusDraft")}
                </span>
                <span className={classes.muted}>
                  {data.salariesPaidAt ? `${t("paySalariesPaid")} · ` : ""}
                  {data.liabilitiesPaidAt ? t("payLiabilitiesPaid") : ""}
                </span>
              </div>
              {editable && <p className={classes.muted}>{t("payDraftHint")}</p>}
              <div className={classes.tableWrap}>
                <table className={classes.table}>
                  <thead>
                    <tr>
                      <th>{t("payName")}</th>
                      <th className={classes.num}>{t("payWorkedDays")}</th>
                      <th className={classes.num}>{t("payOvertimeHours")}</th>
                      <th className={classes.num}>{t("payOtherEarnings")}</th>
                      <th className={classes.num}>{t("payDeductions")}</th>
                      <th className={classes.num}>{t("payGross")}</th>
                      <th className={classes.num}>{t("payInsuranceEmployee")}</th>
                      <th className={classes.num}>{t("payTax")}</th>
                      <th className={classes.num}>{t("payNet")}</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {slips.map((s, i) => {
                      const r = rows[i];
                      const cell = (k: keyof Omit<Row, "employee">, value: number) =>
                        editable && r ? (
                          <input
                            className={pay.cellInput}
                            value={r[k]}
                            onChange={(e) => set(i, { [k]: e.target.value } as Partial<Row>)}
                            inputMode="decimal"
                            aria-label={`${s.name} ${t(k === "workedDays" ? "payWorkedDays" : k === "overtimeHours" ? "payOvertimeHours" : k === "otherEarnings" ? "payOtherEarnings" : "payDeductions")}`}
                          />
                        ) : (
                          f.money(value)
                        );
                      return (
                        <tr key={String(s.employee)}>
                          <td className={classes.wrap}>
                            {s.name}
                            {s.position ? <span className={classes.muted}> · {s.position}</span> : null}
                          </td>
                          <td className={classes.num}>{cell("workedDays", s.workedDays)}</td>
                          <td className={classes.num}>{cell("overtimeHours", s.overtimeHours)}</td>
                          <td className={classes.num}>{cell("otherEarnings", s.otherEarnings)}</td>
                          <td className={classes.num}>{cell("deductions", s.deductions)}</td>
                          <td className={classes.num}>{dirty ? "…" : f.money(s.gross)}</td>
                          <td className={classes.num}>{dirty ? "…" : f.money(s.insuranceEmployee)}</td>
                          <td className={classes.num}>{dirty ? "…" : f.money(s.tax)}</td>
                          <td className={`${classes.num} ${s.net < 0 ? classes.negative : ""}`}>
                            <strong>{dirty ? "…" : f.money(s.net)}</strong>
                          </td>
                          <td>
                            <button type="button" className={pay.linkButton} disabled={dirty} onClick={() => openSlip(s)}>
                              {t("paySlip")}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    <tr className={classes.footRow}>
                      <td colSpan={5}>{t("bizTotal")}</td>
                      <td className={classes.num}>{f.money(T.gross)}</td>
                      <td className={classes.num}>{f.money(T.insuranceEmployee)}</td>
                      <td className={classes.num}>{f.money(T.tax)}</td>
                      <td className={classes.num}>{f.money(T.net)}</td>
                      <td />
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className={classes.tiles}>
                <div className={classes.tile}>
                  <span className={classes.tileLabel}>{t("payCostTotal")}</span>
                  <span className={classes.tileValue}>{f.money(T.gross + T.insuranceEmployer)}</span>
                </div>
                <div className={classes.tile}>
                  <span className={classes.tileLabel}>{t("payInsuranceEmployer")}</span>
                  <span className={classes.tileValue}>{f.money(T.insuranceEmployer)}</span>
                </div>
                <div className={classes.tile}>
                  <span className={classes.tileLabel}>{t("payToTamin")}</span>
                  <span className={classes.tileValue}>{f.money(T.insuranceEmployee + T.insuranceEmployer)}</span>
                </div>
                <div className={classes.tile}>
                  <span className={classes.tileLabel}>{t("payToTaxOffice")}</span>
                  <span className={classes.tileValue}>{f.money(T.tax)}</span>
                </div>
              </div>
              {ctx.canWrite && data.status === "posted" && <PayForm run={data} onDone={changed} />}
              <div className={classes.actions}>
                <button type="button" className={classes.ghost} disabled={dirty} onClick={() => setPopup("PayDisk", <PayrollDisk ctx={ctx} runId={id} />)}>
                  {t("payDiskButton")}
                </button>
              </div>
              {ctx.canWrite && (
                <>
                  {confirm && <p className={classes.muted}>{t(confirm === "post" ? "payPostConfirm" : draft ? "payDeleteConfirm" : "payReopenConfirm")}</p>}
                  <div className={classes.actions}>
                    {confirm ? (
                      <>
                        <button type="button" className={classes.ghost} onClick={() => setConfirm("")}>
                          {t("bizCancel")}
                        </button>
                        <button
                          type="button"
                          className={confirm === "post" ? classes.primary : classes.danger}
                          disabled={busy}
                          onClick={confirm === "post" ? post : reopen}
                        >
                          {t(confirm === "post" ? "payPost" : draft ? "payDelete" : "payReopen")}
                        </button>
                      </>
                    ) : (
                      <>
                        {(draft || (!data.salariesPaidAt && !data.liabilitiesPaidAt)) && (
                          <button type="button" className={classes.danger} onClick={() => setConfirm("reopen")}>
                            {t(draft ? "payDelete" : "payReopen")}
                          </button>
                        )}
                        {draft && (
                          <>
                            <button type="button" className={classes.ghost} disabled={busy || !dirty} onClick={save}>
                              {t("payRecompute")}
                            </button>
                            <button type="button" className={classes.primary} disabled={busy} onClick={() => setConfirm("post")}>
                              {t("payPost")}
                            </button>
                          </>
                        )}
                      </>
                    )}
                  </div>
                </>
              )}
            </>
          )}
        </HandleLoading>
      </div>
    </PopupCard>
  );
};

type RunsData = { runs: PayRun[]; today: { year: number; month: number }; years: number[] };

const PayrollRuns = ({ refreshKey, onChanged }: { refreshKey: number; onChanged: () => unknown }) => {
  const t = usePayText();
  const f = useBizFormat();
  const jm = useJalaliMonth();
  const tag = useIntlLocale();
  const ctx = usePay();
  const { setPopup } = usePopup();
  const pushNotification = useNotification();
  const { data, error, mutate } = useSWR<RunsData>(`${API}${ctx.api}/runs`, (url: string) =>
    fetcher({ url }).then((res) => ({
      runs: asArray<PayRun>(res.data?.runs),
      today: res.data?.today || { year: 0, month: 0 },
      years: asArray<number>(res.data?.years),
    })),
  );
  const [year, setYear] = useState(0);
  const [month, setMonth] = useState(0);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    mutate();
  }, [refreshKey, mutate]);
  useEffect(() => {
    if (data && !year) {
      setYear(data.years.includes(data.today.year) ? data.today.year : data.years[0] || data.today.year);
      setMonth(data.today.month || 1);
    }
  }, [data, year]);
  const changed = () => {
    mutate();
    onChanged();
  };
  const open = (id: string) =>
    setPopup(
      "PayRunDetail",
      <PayContext.Provider value={ctx}>
        <RunDetail ctx={ctx} id={id} onChanged={changed} />
      </PayContext.Provider>,
    );
  const create = async () => {
    if (busy || !year || !month) return;
    setBusy(true);
    try {
      const res = await fetcher({ url: `${API}${ctx.api}/runs`, method: "POST", payload: { year, month } });
      changed();
      const id = (res.data as { _id?: string })?._id;
      if (id) open(id);
    } catch (err) {
      pushNotification((err as Error)?.message || String(err), "Error");
    } finally {
      setBusy(false);
    }
  };
  const runs = asArray<PayRun>(data?.runs);
  return (
    <section className={classes.card}>
      <div className={classes.cardHead}>
        <span className={classes.cardTitle}>{t("payTabRuns")}</span>
        {ctx.canWrite && !!data && (
          <div className={classes.filters}>
            <select value={year} onChange={(e) => setYear(Number(e.target.value))} aria-label={t("payYear")}>
              {(data.years.length ? data.years : [data.today.year]).map((y) => (
                <option key={y} value={y}>
                  {new Intl.NumberFormat(tag, { useGrouping: false }).format(y)}
                </option>
              ))}
            </select>
            <select value={month} onChange={(e) => setMonth(Number(e.target.value))} aria-label={t("payMonth")}>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>
                  {jm.monthName(year || data.today.year, m)}
                </option>
              ))}
            </select>
            <button type="button" className={classes.primary} disabled={busy || !year} onClick={create}>
              {t("payNewRun")}
            </button>
          </div>
        )}
      </div>
      <HandleLoading data={!!data} error={error}>
        {!!data &&
          (runs.length === 0 ? (
            <p className={classes.empty}>{t("payNoRuns")}</p>
          ) : (
            <div className={classes.tableWrap}>
              <table className={classes.table}>
                <thead>
                  <tr>
                    <th>{t("payMonth")}</th>
                    <th>{t("status")}</th>
                    <th className={classes.num}>{t("payGross")}</th>
                    <th className={classes.num}>{t("payNet")}</th>
                    <th>{t("paySalaries")}</th>
                    <th>{t("payLiabilities")}</th>
                  </tr>
                </thead>
                <tbody>
                  {runs.map((r) => (
                    <tr key={r._id} className={classes.rowLink} tabIndex={0} onClick={() => open(r._id)} onKeyDown={(e) => e.key === "Enter" && open(r._id)}>
                      <td>{jm.label(r)}</td>
                      <td>
                        <span className={`${classes.badge} ${r.status === "posted" ? pay.badgeOk : classes.badgeManual}`}>
                          {t(r.status === "posted" ? "payStatusPosted" : "payStatusDraft")}
                        </span>
                      </td>
                      <td className={classes.num}>{f.money(r.totals?.gross)}</td>
                      <td className={classes.num}>{f.money(r.totals?.net)}</td>
                      <td>{r.salariesPaidAt ? f.date(r.salariesPaidAt) : "—"}</td>
                      <td>{r.liabilitiesPaidAt ? f.date(r.liabilitiesPaidAt) : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
      </HandleLoading>
    </section>
  );
};

export default PayrollRuns;
