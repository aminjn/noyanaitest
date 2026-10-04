"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import useSWR from "swr";
import { useSearchParams } from "next/navigation";
import { API, FilePath } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import useNotification from "@/Components/Hooks/useNotification";
import PopupCard from "@/Components/UI/PopupCard";
import DateInput from "@/Components/UI/DateInput";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import { NodeWithAcl } from "@/Components/_Common/SecretaryManager/Request/CreateSecretaryRequestPopup";
import classes from "../Accounting.module.css";
import fin from "./Finance.module.css";
import { asArray, isoDay, useBizFormat } from "../bizShared";
import CostCenterSelect from "../CostCenterSelect";
import FinanceShell from "./FinanceShell";
import PaymentForm, { POPUP_KEY as PAY_KEY } from "./PaymentForm";
import { downloadCsv, FinExpense, FinMoney, idOf, moneyKindKey, nameOf, parseAmount, Pill, useFin, useFinPopup, useFinText, useMoneyAccounts } from "./finShared";
import { RECEIPT_POPUP, ReceiptDraft, ReceiptOcrPopup } from "./Ai/ReceiptOcr";
import { useFinAiPost, useFinAiStatus } from "./Ai/finAi";
import SparkIcon from "@/Components/Icons/SparkIcon";
import ai from "./Ai/FinAi.module.css";
import UncategorizedExpenses from "./Ai/UncategorizedExpenses";

export const FORM_KEY = "FinExpenseForm";
type Acc = { _id: string; code: string; name: string; role?: string };
const NEW = "__new";

const useExpenseAccounts = () => {
  const { api } = useFin();
  return useSWR<Acc[]>(`${API}${api}/expense-accounts`, (url: string) => fetcher({ url }).then((res) => asArray<Acc>(res.data)));
};

// a receipt the AI read: the form opens filled, the user checks it
export type ExpenseInitial = ReceiptDraft["expense"];
const day = (s?: string) => {
  const d = s ? new Date(`${s}T12:00:00`) : new Date();
  return Number.isNaN(d.getTime()) ? new Date() : d;
};

// New expense: its kind (an expense account - a new kind is made right
// here), vendor, amount and VAT, cost centre, the receipt's photo, paid now
// or owed, once or every month / quarter / year.
export const ExpenseForm = ({ onDone, initial }: { onDone: () => unknown; initial?: ExpenseInitial }) => {
  const t = useFinText();
  const f = useBizFormat();
  const { api } = useFin();
  const { close } = useFinPopup();
  const pushNotification = useNotification();
  const { data: accounts, mutate: refreshAccounts } = useExpenseAccounts();
  const { data: money } = useMoneyAccounts();
  const learn = useFinAiPost();
  const [account, setAccount] = useState(initial?.account || "");
  const [newKind, setNewKind] = useState("");
  const [vendor, setVendor] = useState(initial?.vendor || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [amount, setAmount] = useState(initial?.amount ? String(initial.amount) : "");
  const [tax, setTax] = useState(initial?.tax ? String(initial.tax) : "");
  const [date, setDate] = useState<Date>(day(initial?.date));
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [center, setCenter] = useState(initial?.center || "");
  const [attachment, setAttachment] = useState(initial?.attachment || "");
  const [uploading, setUploading] = useState(false);
  const [payNow, setPayNow] = useState(initial ? !!initial.payNow : true);
  const [payFrom, setPayFrom] = useState("");
  const [recurring, setRecurring] = useState(false);
  const [interval, setEvery] = useState<"monthly" | "quarterly" | "yearly">("monthly");
  const [until, setUntil] = useState<Date | null>(null);
  const [busy, setBusy] = useState(false);
  const tills = asArray<FinMoney>(money).filter((a) => a.isActive);
  const from = tills.find((a) => a._id === payFrom) ? payFrom : tills[0]?._id || "";
  const fromKind = tills.find((a) => a._id === from)?.kind;

  const upload = async (file?: File | null) => {
    if (!file) return;
    setUploading(true);
    try {
      const res = await fetcher({ url: `${API}${api}/upload`, method: "POST", payload: { file }, bodyParser: "FORM" });
      setAttachment(String(res.data?.file || ""));
    } catch (err) {
      pushNotification((err as Error)?.message || String(err), "Error");
    } finally {
      setUploading(false);
    }
  };

  // the new kind of expense: a detail account under «هزینه‌های عمومی و اداری»
  const addKind = async () => {
    if (newKind.trim().length < 2) return;
    try {
      const res = await fetcher({ url: `${API}${api.replace(/\/finance$/, "")}/accounts`, method: "POST", payload: { parentCode: "72", name: newKind.trim() } });
      await refreshAccounts();
      setAccount(String(res.data?._id || ""));
      setNewKind("");
    } catch (err) {
      pushNotification((err as Error)?.message || String(err), "Error");
    }
  };

  const value = parseAmount(amount);
  const ready = !!account && account !== NEW && value > 0 && !uploading && (!payNow || recurring || !!from);
  const save = async () => {
    if (busy || !ready) return;
    setBusy(true);
    try {
      await fetcher({
        url: `${API}${api}/expenses`,
        method: "POST",
        payload: {
          date: isoDay(date),
          dueDate: dueDate ? isoDay(dueDate) : null,
          account,
          vendor: vendor.trim() || undefined,
          description: description.trim() || undefined,
          amount: value,
          tax: parseAmount(tax),
          center: center || undefined,
          attachment: attachment || undefined,
          payFrom: payNow ? from : undefined,
          method: payNow ? (fromKind === "pos" ? "card" : fromKind === "bank" ? "transfer" : fromKind === "wallet" ? "wallet" : "cash") : undefined,
          recurring: recurring ? { interval, until: until ? isoDay(until) : null } : null,
        },
      });
      pushNotification(t("bizSaved"), "Success");
      // the vendor's kind, remembered for the next receipt
      if (initial && vendor.trim().length > 1) learn("learn", { text: vendor.trim(), account, center: center || undefined }).catch(() => undefined);
      close(FORM_KEY);
      onDone();
    } catch (err) {
      pushNotification((err as Error)?.message || String(err), "Error");
      setBusy(false);
    }
  };

  return (
    <PopupCard title={t(initial ? "faiExpenseFromReceipt" : "finNewExpense")}>
      <div className={classes.popup}>
        <div className={classes.form}>
          <label className={classes.field}>
            <span>{t("finExpenseKind")}</span>
            <select value={account} onChange={(e) => setAccount(e.target.value)}>
              <option value="">{t("bizSelect")}</option>
              {asArray<Acc>(accounts).map((a) => (
                <option key={a._id} value={a._id}>
                  {a.name}
                </option>
              ))}
              <option value={NEW}>{t("finNewKind")}</option>
            </select>
          </label>
          {account === NEW && (
            <div className={classes.field}>
              <span>{t("finNewKind")}</span>
              <div className={classes.filters}>
                <input value={newKind} maxLength={200} onChange={(e) => setNewKind(e.target.value)} />
                <button type="button" className={classes.ghost} disabled={newKind.trim().length < 2} onClick={addKind}>
                  {t("bizAdd")}
                </button>
              </div>
            </div>
          )}
          <label className={classes.field}>
            <span>{t("finVendor")}</span>
            <input value={vendor} maxLength={200} onChange={(e) => setVendor(e.target.value)} />
          </label>
          <label className={classes.field}>
            <span>{t("finNetAmount")}</span>
            <input value={amount} dir="ltr" inputMode="numeric" onChange={(e) => setAmount(e.target.value)} />
          </label>
          <label className={classes.field}>
            <span>{t("finVatPaid")}</span>
            <input value={tax} dir="ltr" inputMode="numeric" onChange={(e) => setTax(e.target.value)} />
          </label>
          <div className={classes.field}>
            <DateInput title={t("bizDate")} defaultValue={date} onChange={(d) => setDate(d)} />
          </div>
          {!payNow && !recurring && (
            <div className={classes.field}>
              <DateInput title={t("finDueDate")} onChange={(d) => setDueDate(d)} onClear={() => setDueDate(null)} />
            </div>
          )}
          <CostCenterSelect value={center} onChange={setCenter} />
          <label className={classes.field}>
            <span>{t("finReceiptPhoto")}</span>
            <input type="file" accept="image/*,application/pdf" onChange={(e) => upload(e.target.files?.[0])} />
            {uploading && <span className={fin.small}>…</span>}
            {!!attachment && <span className={fin.small}>{t("finAttached")}</span>}
          </label>
          <label className={`${classes.field} ${classes.wide}`}>
            <span>{t("bizDescription")}</span>
            <input value={description} maxLength={500} onChange={(e) => setDescription(e.target.value)} />
          </label>
        </div>
        <label className={fin.check}>
          <input type="checkbox" checked={payNow} onChange={(e) => setPayNow(e.target.checked)} />
          {t("finPaidNow")}
        </label>
        {payNow && (
          <div className={classes.form}>
            <label className={classes.field}>
              <span>{t("bizPaidFrom")}</span>
              <select value={from} onChange={(e) => setPayFrom(e.target.value)}>
                {tills.map((a) => (
                  <option key={a._id} value={a._id}>
                    {a.name} · {t(moneyKindKey(a.kind))}
                  </option>
                ))}
              </select>
            </label>
          </div>
        )}
        <label className={fin.check}>
          <input type="checkbox" checked={recurring} onChange={(e) => setRecurring(e.target.checked)} />
          {t("finRecurring")}
        </label>
        {recurring && (
          <div className={classes.form}>
            <label className={classes.field}>
              <span>{t("finInterval")}</span>
              <select value={interval} onChange={(e) => setEvery(e.target.value as typeof interval)}>
                <option value="monthly">{t("finMonthly")}</option>
                <option value="quarterly">{t("finQuarterly")}</option>
                <option value="yearly">{t("finYearly")}</option>
              </select>
            </label>
            <div className={classes.field}>
              <DateInput title={t("finUntil")} onChange={(d) => setUntil(d)} onClear={() => setUntil(null)} />
            </div>
            <p className={`${classes.muted} ${classes.wide}`}>{t("finRecurringHint")}</p>
          </div>
        )}
        <div className={fin.summaryBar}>
          <span>
            {t("bizTotal")}: <b>{f.money(value + parseAmount(tax))}</b> {t("toman")}
          </span>
        </div>
        <div className={classes.actions}>
          <button type="button" className={classes.ghost} onClick={() => close(FORM_KEY)}>
            {t("bizCancel")}
          </button>
          <button type="button" className={classes.primary} disabled={busy || !ready} onClick={save}>
            {t("bizSave")}
          </button>
        </div>
      </div>
    </PopupCard>
  );
};

type List = { items: FinExpense[]; total: number; sums: { total: number; paid: number; due: number }; byAccount: { account: string; name: string; total: number }[] };
const STATUSES = ["", "unpaid", "paid", "recurring"] as const;

const Body = () => {
  const t = useFinText();
  const f = useBizFormat();
  const { api, canWrite } = useFin();
  const { open } = useFinPopup();
  const pushNotification = useNotification();
  const params = useSearchParams();
  const { data: accounts } = useExpenseAccounts();
  const initial = params?.get("status") || "";
  const [status, setStatus] = useState<string>(STATUSES.includes(initial as (typeof STATUSES)[number]) ? initial : "");
  const [account, setAccount] = useState("");
  const [q, setQ] = useState("");
  const [from, setFrom] = useState<Date | null>(null);
  const [to, setTo] = useState<Date | null>(null);
  const [page, setPage] = useState(1);
  const limit = 25;
  const query = useMemo(() => {
    const p = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (status) p.set("status", status);
    if (account) p.set("account", account);
    if (q.trim()) p.set("q", q.trim());
    if (from) p.set("from", isoDay(from));
    if (to) p.set("to", isoDay(to));
    return p.toString();
  }, [account, from, page, q, status, to]);
  const { data, error, mutate } = useSWR<List>(`${API}${api}/expenses?${query}`, (url: string) => fetcher({ url }).then((res) => res.data as List));
  const rows = asArray<FinExpense>(data?.items);
  const pages = Math.max(1, Math.ceil((data?.total || 0) / limit));
  const top = asArray<List["byAccount"][number]>(data?.byAccount);
  const topMax = Math.max(1, ...top.map((b) => b.total));
  const create = () => open(FORM_KEY, <ExpenseForm onDone={() => mutate()} />);
  const { data: aiStatus } = useFinAiStatus();
  const readReceipt = () =>
    open(RECEIPT_POPUP, <ReceiptOcrPopup onDraft={(d) => open(FORM_KEY, <ExpenseForm initial={d.expense} onDone={() => mutate()} />)} />);
  const opened = useRef(false);
  useEffect(() => {
    if (!opened.current && canWrite && params?.get("new") === "1") {
      opened.current = true;
      create();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canWrite, params]);
  const post = async (path: string, payload: Record<string, unknown>, confirm?: string) => {
    if (confirm && !window.confirm(t(confirm))) return;
    try {
      await fetcher({ url: `${API}${api}/expenses/${path}`, method: "POST", payload });
      pushNotification(t("bizSaved"), "Success");
      mutate();
    } catch (err) {
      pushNotification((err as Error)?.message || String(err), "Error");
    }
  };
  const exportCsv = () =>
    downloadCsv("expenses", [
      [t("bizNumber"), t("bizDate"), t("finExpenseKind"), t("finVendor"), t("bizDescription"), t("finNetAmount"), t("finVatPaid"), t("bizTotal"), t("invPaid")],
      ...rows.map((e) => [e.number, f.date(e.date), nameOf(e.account, ""), e.vendor || "", e.description, e.amount, e.tax, e.total, e.paid]),
    ]);

  return (
    <>
      <div className={classes.tiles}>
        <div className={classes.tile}>
          <span className={classes.tileLabel}>{t("finExpensesTotal")}</span>
          <span className={classes.tileValue}>
            {f.money(data?.sums.total)}
            <span className={classes.tileUnit}>{t("toman")}</span>
          </span>
        </div>
        <div className={classes.tile}>
          <span className={classes.tileLabel}>{t("invPaid")}</span>
          <span className={classes.tileValue}>
            {f.money(data?.sums.paid)}
            <span className={classes.tileUnit}>{t("toman")}</span>
          </span>
        </div>
        <div className={classes.tile}>
          <span className={classes.tileLabel}>{t("finToPay")}</span>
          <span className={`${classes.tileValue} ${(data?.sums.due || 0) > 0 ? classes.negative : ""}`}>
            {f.money(data?.sums.due)}
            <span className={classes.tileUnit}>{t("toman")}</span>
          </span>
        </div>
      </div>
      {top.length > 0 && status !== "recurring" && (
        <section className={classes.card}>
          <span className={classes.cardTitle}>{t("finTopKinds")}</span>
          <dl className={fin.kv}>
            {top.map((b) => (
              <div key={b.account}>
                <dt style={{ flex: 1 }}>
                  {b.name}
                  <span className={fin.shareBar} style={{ width: `${(b.total / topMax) * 100}%` }} />
                </dt>
                <dd>{f.money(b.total)}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}
      <section className={classes.card}>
        <div className={classes.cardHead}>
          <div className={classes.segmented} role="tablist">
            {STATUSES.map((s) => (
              <button key={s || "all"} type="button" role="tab" aria-selected={status === s} className={status === s ? classes.on : ""} onClick={() => (setStatus(s), setPage(1))}>
                {t(s === "unpaid" ? "finUnpaid" : s === "paid" ? "finStPaid" : s === "recurring" ? "finRecurringList" : "finAll")}
              </button>
            ))}
          </div>
          <div className={classes.actions}>
            <button type="button" className={classes.ghost} onClick={exportCsv} disabled={!rows.length}>
              {t("finExportCsv")}
            </button>
            {canWrite && aiStatus?.enabled && (
              <button type="button" className={ai.aiButton} onClick={readReceipt}>
                <SparkIcon />
                {t("faiReadReceipt")}
              </button>
            )}
            {canWrite && (
              <button type="button" className={classes.primary} onClick={create}>
                {t("finNewExpense")}
              </button>
            )}
          </div>
        </div>
        <div className={classes.filters}>
          <input type="search" placeholder={t("finSearchExpenses")} value={q} onChange={(e) => (setQ(e.target.value), setPage(1))} />
          <select value={account} onChange={(e) => (setAccount(e.target.value), setPage(1))} aria-label={t("finExpenseKind")}>
            <option value="">{t("finAllKinds")}</option>
            {asArray<Acc>(accounts).map((a) => (
              <option key={a._id} value={a._id}>
                {a.name}
              </option>
            ))}
          </select>
          <DateInput title={t("bizFrom")} onChange={(d) => (setFrom(d), setPage(1))} onClear={() => setFrom(null)} />
          <DateInput title={t("bizTo")} onChange={(d) => (setTo(d), setPage(1))} onClear={() => setTo(null)} />
        </div>
        <p className={classes.muted}>{t("finPayrollNote")}</p>
        {canWrite && aiStatus?.enabled && status !== "recurring" && <UncategorizedExpenses onChanged={() => mutate()} />}
        <HandleLoading data={!!data} error={error}>
          {!!data &&
            (rows.length === 0 ? (
              <p className={classes.empty}>{t("finNoExpenses")}</p>
            ) : (
              <div className={classes.tableWrap}>
                <table className={classes.table}>
                  <thead>
                    <tr>
                      <th>{status === "recurring" ? t("finNextDate") : t("bizDate")}</th>
                      <th>{t("finExpenseKind")}</th>
                      <th>{t("finVendor")}</th>
                      <th className={classes.num}>{t("bizTotal")}</th>
                      <th className={classes.num}>{status === "recurring" ? t("finInterval") : t("invDue")}</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((e) => {
                      const due = Math.max(0, e.total - e.paid);
                      return (
                        <tr key={e._id}>
                          <td>{f.date(e.recurring ? e.recurring.nextDate : e.date)}</td>
                          <td className={classes.wrap}>
                            {nameOf(e.account)}
                            {!!e.description && <span className={fin.small}> · {e.description}</span>}
                            {!!idOf(e.center) && <span className={fin.small}> · {nameOf(e.center)}</span>}
                          </td>
                          <td className={classes.wrap}>{e.vendor || "—"}</td>
                          <td className={classes.num}>{f.money(e.total)}</td>
                          <td className={`${classes.num} ${!e.recurring && due > 0 ? classes.negative : ""}`}>
                            {e.recurring ? (
                              <>
                                {t(e.recurring.interval === "monthly" ? "finMonthly" : e.recurring.interval === "quarterly" ? "finQuarterly" : "finYearly")}{" "}
                                <Pill status={e.recurring.isActive ? "issued" : "void"}>{t(e.recurring.isActive ? "finActive" : "finPaused")}</Pill>
                              </>
                            ) : due > 0 ? (
                              f.money(due)
                            ) : (
                              <Pill status="paid">{t("finStPaid")}</Pill>
                            )}
                          </td>
                          <td>
                            <div className={fin.rowActions}>
                              {!!e.attachment && (
                                <a href={/^https?:\/\//.test(e.attachment) ? e.attachment : `${FilePath}/${e.attachment}`} target="_blank" rel="noreferrer" className={fin.link}>
                                  {t("finReceiptPhoto")}
                                </a>
                              )}
                              {canWrite && !e.recurring && due > 0 && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    open(PAY_KEY, <PaymentForm direction="out" against="expense" docId={e._id} open={due} party={e.vendor} onDone={() => mutate()} />)
                                  }
                                >
                                  {t("finPay")}
                                </button>
                              )}
                              {canWrite && e.recurring && (
                                <button type="button" onClick={() => post(`${e._id}/recurring`, { isActive: !e.recurring!.isActive })}>
                                  {t(e.recurring.isActive ? "finPause" : "finResume")}
                                </button>
                              )}
                              {canWrite && (
                                <button type="button" className={fin.bad} onClick={() => post(`${e._id}/void`, {}, e.recurring ? "bizDeleteConfirm" : "finVoidExpenseConfirm")}>
                                  {t(e.recurring ? "bizDelete" : "finVoid")}
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ))}
        </HandleLoading>
        {pages > 1 && (
          <div className={classes.pagination}>
            <button type="button" disabled={page <= 1} onClick={() => setPage(page - 1)}>
              {t("bizPrev")}
            </button>
            <span>{t("bizPage", [f.year(page), f.year(pages)])}</span>
            <button type="button" disabled={page >= pages} onClick={() => setPage(page + 1)}>
              {t("bizNext")}
            </button>
          </div>
        )}
      </section>
    </>
  );
};

// «مالی و حسابداری» → هزینه‌ها (2026-10): rent, utilities, consumables, an
// outside lab... with vendor, VAT, cost centre and the receipt's photo,
// paid now or later, once or every period; salaries stay in payroll.
const FinanceExpenses = ({ node, panel }: { node: NodeWithAcl; panel: string }) => (
  <FinanceShell node={node} panel={panel} title="finExpensesTitle" subtitle="finExpensesSubtitle" segment="expenses">
    <Body />
  </FinanceShell>
);

export default FinanceExpenses;
