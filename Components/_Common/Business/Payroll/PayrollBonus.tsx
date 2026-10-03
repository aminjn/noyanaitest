"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import useNotification from "@/Components/Hooks/useNotification";
import usePopup from "@/Components/Hooks/usePopup";
import PopupCard from "@/Components/UI/PopupCard";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import classes from "../Accounting.module.css";
import pay from "./Payroll.module.css";
import { asArray, useBizFormat } from "../bizShared";
import { PayBonusRun, PayBonusSlip, PayContext, PayEmployee, toNum, usePay, usePayAccounts, usePayEmployees, usePayText } from "./payShared";

type Ctx = { api: string; canWrite: boolean };
const DETAIL = "PayBonusDetail";

const currentYear = () =>
  Number(new Intl.DateTimeFormat("en-u-ca-persian", { year: "numeric", timeZone: "Asia/Tehran" }).format(new Date()).replace(/\D/g, ""));

// paying the net to the staff, or the Eid tax to the tax office
const PayBonus = ({ run, onDone }: { run: PayBonusRun; onDone: () => unknown }) => {
  const t = usePayText();
  const f = useBizFormat();
  const { api } = usePay();
  const pushNotification = useNotification();
  const { data: accounts } = usePayAccounts();
  const options = (["salaries", "liabilities"] as const).filter(
    (w) => !(w === "salaries" ? run.salariesPaidAt : run.liabilitiesPaidAt) && (w === "salaries" ? run.totals.net : run.totals.tax) > 0,
  );
  const [what, setWhat] = useState<"salaries" | "liabilities">(options[0] || "salaries");
  const [via, setVia] = useState("");
  const [busy, setBusy] = useState(false);
  if (!options.length) return null;
  const current = options.includes(what) ? what : options[0];
  const save = async () => {
    if (busy || !via) return;
    setBusy(true);
    try {
      await fetcher({ url: `${API}${api}/bonus/${run._id}/pay`, method: "POST", payload: { what: current, via } });
      pushNotification(t("payPaid"), "Success");
      onDone();
    } catch (err) {
      pushNotification((err as Error)?.message || String(err), "Error");
    } finally {
      setBusy(false);
    }
  };
  return (
    <section className={classes.card}>
      <div className={classes.segmented}>
        {options.map((w) => (
          <button key={w} type="button" className={current === w ? classes.on : ""} onClick={() => setWhat(w)}>
            {t(w === "salaries" ? "payBonusPayStaff" : "payBonusPayTax")}
          </button>
        ))}
      </div>
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
          <span>{t("bizAmount")}</span>
          <strong>{f.money(current === "salaries" ? run.totals.net : run.totals.tax)}</strong>
        </div>
      </div>
      <div className={classes.actions}>
        <button type="button" className={classes.primary} disabled={busy || !via} onClick={save}>
          {t("payPayNow")}
        </button>
      </div>
    </section>
  );
};

const BonusDetail = ({ id, onChanged }: { id: string; onChanged: () => unknown }) => {
  const t = usePayText();
  const f = useBizFormat();
  const { api, canWrite } = usePay();
  const { closePopup } = usePopup();
  const pushNotification = useNotification();
  const { data, error, mutate } = useSWR<PayBonusRun | null>([`${API}${api}/bonus`, id], ([url]: [string, string]) =>
    fetcher({ url }).then((res) => asArray<PayBonusRun>(res.data).find((r) => r._id === id) || null),
  );
  const [rows, setRows] = useState<{ employee: string; days: string; deductions: string }[]>([]);
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState<"" | "post" | "reopen">("");
  useEffect(() => {
    if (data) setRows(asArray<PayBonusSlip>(data.slips).map((s) => ({ employee: s.employee, days: String(s.days), deductions: s.deductions ? String(s.deductions) : "" })));
  }, [data]);
  const draft = data?.status === "draft";
  const dirty = !!data && rows.some((r, i) => toNum(r.days) !== data.slips[i]?.days || toNum(r.deductions) !== data.slips[i]?.deductions);
  const call = async (fn: () => Promise<unknown>, ok: string) => {
    if (busy) return false;
    setBusy(true);
    try {
      await fn();
      pushNotification(ok, "Success");
      await mutate();
      onChanged();
      return true;
    } catch (err) {
      pushNotification((err as Error)?.message || String(err), "Error");
      return false;
    } finally {
      setBusy(false);
      setConfirm("");
    }
  };
  const save = () =>
    call(
      () =>
        fetcher({
          url: `${API}${api}/bonus/${id}`,
          method: "PATCH",
          payload: { slips: rows.map((r) => ({ employee: r.employee, days: toNum(r.days), deductions: toNum(r.deductions) })) },
        }),
      t("bizSaved"),
    );
  const post = () => call(() => fetcher({ url: `${API}${api}/bonus/${id}/post`, method: "POST" }), t("payPosted"));
  const reopen = async () => {
    const ok = await call(() => fetcher({ url: `${API}${api}/bonus/${id}/reopen`, method: "POST" }), t(draft ? "payDeleted" : "payReopened"));
    if (ok && draft) closePopup(DETAIL);
  };
  const T = data?.totals;
  return (
    <PopupCard size="wide" title={data ? t("payBonusTitle", [f.year(data.year)]) : t("payTabBonus")}>
      <div className={classes.popup}>
        <HandleLoading data={data !== undefined} error={error}>
          {!!data && (
            <>
              <p className={classes.muted}>{t("payBonusRules", [f.money(data.yearDays)])}</p>
              <div className={classes.tableWrap}>
                <table className={classes.table}>
                  <thead>
                    <tr>
                      <th>{t("payName")}</th>
                      <th className={classes.num}>{t("payBonusDays")}</th>
                      <th className={classes.num}>{t("payBaseSalary")}</th>
                      <th className={classes.num}>{t("payEid")}</th>
                      <th className={classes.num}>{t("paySeverance")}</th>
                      <th className={classes.num}>{t("payTax")}</th>
                      <th className={classes.num}>{t("payDeductions")}</th>
                      <th className={classes.num}>{t("payNet")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {asArray<PayBonusSlip>(data.slips).map((s: PayBonusSlip, i) => (
                      <tr key={s.employee}>
                        <td className={classes.wrap}>{s.name}</td>
                        <td className={classes.num}>
                          {draft && canWrite ? (
                            <input
                              className={pay.cellInput}
                              inputMode="numeric"
                              dir="ltr"
                              value={rows[i]?.days ?? ""}
                              onChange={(e) => setRows((p) => p.map((r, j) => (j === i ? { ...r, days: e.target.value } : r)))}
                            />
                          ) : (
                            f.money(s.days)
                          )}
                        </td>
                        <td className={classes.num}>{f.money(s.baseSalary)}</td>
                        <td className={classes.num}>{f.money(s.eid)}</td>
                        <td className={classes.num}>{f.money(s.severance)}</td>
                        <td className={classes.num}>{f.money(s.tax)}</td>
                        <td className={classes.num}>
                          {draft && canWrite ? (
                            <input
                              className={pay.cellInput}
                              inputMode="numeric"
                              dir="ltr"
                              value={rows[i]?.deductions ?? ""}
                              onChange={(e) => setRows((p) => p.map((r, j) => (j === i ? { ...r, deductions: e.target.value } : r)))}
                            />
                          ) : (
                            f.money(s.deductions)
                          )}
                        </td>
                        <td className={classes.num}>{f.money(s.net)}</td>
                      </tr>
                    ))}
                    {!!T && (
                      <tr className={classes.totalRow}>
                        <td colSpan={3}>{t("bizTotal")}</td>
                        <td className={classes.num}>{f.money(T.eid)}</td>
                        <td className={classes.num}>{f.money(T.severance)}</td>
                        <td className={classes.num}>{f.money(T.tax)}</td>
                        <td className={classes.num}>{f.money(T.deductions)}</td>
                        <td className={classes.num}>{f.money(T.net)}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {canWrite && data.status === "posted" && <PayBonus run={data} onDone={() => { mutate(); onChanged(); }} />}
              {canWrite && (
                <>
                  {confirm && <p className={classes.muted}>{t(confirm === "post" ? "payBonusPostConfirm" : draft ? "payDeleteConfirm" : "payReopenConfirm")}</p>}
                  <div className={classes.actions}>
                    {confirm ? (
                      <>
                        <button type="button" className={classes.ghost} onClick={() => setConfirm("")}>
                          {t("bizCancel")}
                        </button>
                        <button type="button" className={confirm === "post" ? classes.primary : classes.danger} disabled={busy} onClick={confirm === "post" ? post : reopen}>
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
                            <button type="button" className={classes.primary} disabled={busy || dirty} onClick={() => setConfirm("post")}>
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

// عیدی و سنوات: one run a year for everyone (usually in Esfand), or a
// settlement for those who leave mid-year
const PayrollBonus = ({ refreshKey, onChanged }: { refreshKey: number; onChanged: () => unknown }) => {
  const t = usePayText();
  const f = useBizFormat();
  const ctx = usePay();
  const { setPopup } = usePopup();
  const pushNotification = useNotification();
  const { data, error, mutate } = useSWR<PayBonusRun[]>(`${API}${ctx.api}/bonus`, (url: string) =>
    fetcher({ url }).then((res) => asArray<PayBonusRun>(res.data)),
  );
  const { data: employees } = usePayEmployees();
  const [year, setYear] = useState(currentYear);
  const [only, setOnly] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    mutate();
  }, [refreshKey, mutate]);
  const open = (id: string) =>
    setPopup(
      DETAIL,
      <PayContext.Provider value={ctx as Ctx}>
        <BonusDetail id={id} onChanged={() => { mutate(); onChanged(); }} />
      </PayContext.Provider>,
    );
  const create = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const res = await fetcher({ url: `${API}${ctx.api}/bonus`, method: "POST", payload: { year, ...(only ? { employees: [only] } : {}) } });
      await mutate();
      onChanged();
      const id = (res.data as { _id?: string })?._id;
      if (id) open(id);
    } catch (err) {
      pushNotification((err as Error)?.message || String(err), "Error");
    } finally {
      setBusy(false);
    }
  };
  const rows = asArray<PayBonusRun>(data);
  return (
    <section className={classes.card}>
      <span className={classes.cardTitle}>{t("payTabBonus")}</span>
      <p className={classes.muted}>{t("payBonusHint")}</p>
      {ctx.canWrite && (
        <div className={classes.form}>
          <label className={classes.field}>
            {t("bizFiscalYearCol")}
            <select value={year} onChange={(e) => setYear(Number(e.target.value))}>
              {[currentYear() - 1, currentYear()].map((y) => (
                <option key={y} value={y}>
                  {f.year(y)}
                </option>
              ))}
            </select>
          </label>
          <label className={classes.field}>
            {t("payBonusFor")}
            <select value={only} onChange={(e) => setOnly(e.target.value)}>
              <option value="">{t("payBonusEveryone")}</option>
              {asArray<PayEmployee>(employees).map((e) => (
                <option key={e._id} value={e._id}>
                  {t("payBonusSettlementOf", [e.name])}
                </option>
              ))}
            </select>
          </label>
          <div className={classes.actions}>
            <button type="button" className={classes.primary} disabled={busy} onClick={create}>
              {t("payBonusCreate")}
            </button>
          </div>
        </div>
      )}
      <HandleLoading data={data !== undefined} error={error}>
        {rows.length === 0 ? (
          <p className={classes.empty}>{t("payBonusNone")}</p>
        ) : (
          <div className={classes.tableWrap}>
            <table className={classes.table}>
              <thead>
                <tr>
                  <th>{t("bizFiscalYearCol")}</th>
                  <th className={classes.num}>{t("payTabEmployees")}</th>
                  <th className={classes.num}>{t("payEid")}</th>
                  <th className={classes.num}>{t("paySeverance")}</th>
                  <th className={classes.num}>{t("payNet")}</th>
                  <th>{t("status")}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r._id} className={classes.rowLink} onClick={() => open(r._id)}>
                    <td>{f.year(r.year)}</td>
                    <td className={classes.num}>{f.money(r.slips.length)}</td>
                    <td className={classes.num}>{f.money(r.totals.eid)}</td>
                    <td className={classes.num}>{f.money(r.totals.severance)}</td>
                    <td className={classes.num}>{f.money(r.totals.net)}</td>
                    <td>
                      <span className={`${classes.badge} ${r.status === "posted" ? classes.badgeAuto : ""}`}>
                        {t(r.status === "draft" ? "payStatusDraft" : r.salariesPaidAt ? "payStatusPaid" : "payStatusPosted")}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </HandleLoading>
    </section>
  );
};

export default PayrollBonus;
