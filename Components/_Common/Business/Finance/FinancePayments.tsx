"use client";

import { ReactNode, useMemo, useState } from "react";
import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import useNotification from "@/Components/Hooks/useNotification";
import PopupCard from "@/Components/UI/PopupCard";
import DateInput from "@/Components/UI/DateInput";
import ClientTabSystem from "@/Components/UI/ClientTabSystem";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import { NodeWithAcl } from "@/Components/_Common/SecretaryManager/Request/CreateSecretaryRequestPopup";
import classes from "../Accounting.module.css";
import fin from "./Finance.module.css";
import { asArray, isoDay, useBizFormat } from "../bizShared";
import FinanceShell from "./FinanceShell";
import PaymentForm, { POPUP_KEY as PAY_KEY } from "./PaymentForm";
import {
  downloadCsv,
  FinMoney,
  FinPayment,
  methodKey,
  moneyKindKey,
  nameOf,
  numberOf,
  parseAmount,
  Pill,
  statusKey,
  useFin,
  useFinPopup,
  useFinText,
  useMoneyAccounts,
  useTabParam,
} from "./finShared";

const CHQ_KEY = "FinChequeStatus";
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const MONEY_KEY = "FinMoneyForm";
const REC_KEY = "FinReconcile";

const againstLabel = (t: (k: string, v?: string[]) => string, p: FinPayment) => {
  if (p.against === "invoice") return t("finAgainstInvoice", [String(numberOf(p.invoice) ?? "")]);
  if (p.against === "claim") return t("finAgainstClaim", [String(numberOf(p.claim) ?? "")]);
  if (p.against === "expense") return t("finAgainstExpense", [String(numberOf(p.expense) ?? "")]);
  return nameOf(p.account, "");
};

// ---------------------------------------------------------- all entries

type PayList = { items: FinPayment[]; total: number; in: number; out: number };

const Entries = () => {
  const t = useFinText();
  const f = useBizFormat();
  const { api, canWrite } = useFin();
  const { open } = useFinPopup();
  const pushNotification = useNotification();
  const [direction, setDirection] = useState<"" | "in" | "out">("");
  const [method, setMethod] = useState("");
  const [q, setQ] = useState("");
  const [from, setFrom] = useState<Date | null>(null);
  const [to, setTo] = useState<Date | null>(null);
  const [page, setPage] = useState(1);
  const limit = 25;
  const query = useMemo(() => {
    const p = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (direction) p.set("direction", direction);
    if (method) p.set("method", method);
    if (q.trim()) p.set("q", q.trim());
    if (from) p.set("from", isoDay(from));
    if (to) p.set("to", isoDay(to));
    return p.toString();
  }, [direction, from, method, page, q, to]);
  const { data, error, mutate } = useSWR<PayList>(`${API}${api}/payments?${query}`, (url: string) => fetcher({ url }).then((res) => res.data as PayList));
  const rows = asArray<FinPayment>(data?.items);
  const pages = Math.max(1, Math.ceil((data?.total || 0) / limit));
  const voidIt = async (p: FinPayment) => {
    if (!window.confirm(t("finVoidPaymentConfirm"))) return;
    try {
      await fetcher({ url: `${API}${api}/payments/${p._id}/void`, method: "POST", payload: {} });
      pushNotification(t("finVoided"), "Success");
      mutate();
    } catch (err) {
      pushNotification((err as Error)?.message || String(err), "Error");
    }
  };
  const exportCsv = () =>
    downloadCsv("payments", [
      [t("bizNumber"), t("bizDate"), t("finDirection"), t("finMethod"), t("finTill"), t("finParty"), t("finAgainst"), t("bizAmount"), t("status")],
      ...rows.map((p) => [
        p.number,
        f.date(p.date),
        t(p.direction === "in" ? "finIn" : "finOut"),
        t(methodKey(p.method)),
        nameOf(p.money, ""),
        p.party || "",
        againstLabel(t, p),
        p.amount,
        p.isVoid ? t("finStVoid") : p.cheque ? t(statusKey(p.cheque.status)) : "",
      ]),
    ]);
  return (
    <section className={classes.card}>
      <div className={classes.cardHead}>
        <div className={classes.segmented} role="tablist">
          {(["", "in", "out"] as const).map((d) => (
            <button
              key={d || "all"}
              type="button"
              role="tab"
              aria-selected={direction === d}
              className={direction === d ? classes.on : ""}
              onClick={() => (setDirection(d), setPage(1))}
            >
              {t(d === "in" ? "finReceipts" : d === "out" ? "finPaymentsOut" : "finAll")}
            </button>
          ))}
        </div>
        <div className={classes.actions}>
          <button type="button" className={classes.ghost} onClick={exportCsv} disabled={!rows.length}>
            {t("finExportCsv")}
          </button>
          {canWrite && (
            <>
              <button type="button" className={classes.ghost} onClick={() => open(PAY_KEY, <PaymentForm direction="out" against="account" onDone={() => mutate()} />)}>
                {t("finNewPayment")}
              </button>
              <button type="button" className={classes.primary} onClick={() => open(PAY_KEY, <PaymentForm direction="in" against="account" onDone={() => mutate()} />)}>
                {t("finNewReceipt")}
              </button>
            </>
          )}
        </div>
      </div>
      <div className={classes.filters}>
        <input type="search" placeholder={t("finSearchPayments")} value={q} onChange={(e) => (setQ(e.target.value), setPage(1))} />
        <select value={method} onChange={(e) => (setMethod(e.target.value), setPage(1))} aria-label={t("finMethod")}>
          <option value="">{t("finAllMethods")}</option>
          {["cash", "card", "transfer", "cheque", "wallet"].map((m) => (
            <option key={m} value={m}>
              {t(methodKey(m))}
            </option>
          ))}
        </select>
        <DateInput title={t("bizFrom")} onChange={(d) => (setFrom(d), setPage(1))} onClear={() => setFrom(null)} />
        <DateInput title={t("bizTo")} onChange={(d) => (setTo(d), setPage(1))} onClear={() => setTo(null)} />
      </div>
      <div className={fin.summaryBar}>
        <span>
          {t("finReceipts")}: <b className={classes.positive}>{f.money(data?.in)}</b>
        </span>
        <span>
          {t("finPaymentsOut")}: <b className={classes.negative}>{f.money(data?.out)}</b>
        </span>
      </div>
      <HandleLoading data={!!data} error={error}>
        {!!data &&
          (rows.length === 0 ? (
            <p className={classes.empty}>{t("finNoPayments")}</p>
          ) : (
            <div className={classes.tableWrap}>
              <table className={classes.table}>
                <thead>
                  <tr>
                    <th>{t("bizDate")}</th>
                    <th>{t("finParty")}</th>
                    <th>{t("finAgainst")}</th>
                    <th>{t("finMethod")}</th>
                    <th>{t("finTill")}</th>
                    <th className={classes.num}>{t("bizAmount")}</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {rows.map((p) => (
                    <tr key={p._id}>
                      <td>{f.date(p.date)}</td>
                      <td className={classes.wrap}>{p.party || p.description || "—"}</td>
                      <td className={classes.wrap}>{againstLabel(t, p)}</td>
                      <td>
                        {t(methodKey(p.method))} {p.cheque && <Pill status={p.cheque.status}>{t(statusKey(p.cheque.status))}</Pill>}
                        {p.isVoid && <Pill status="void">{t("finStVoid")}</Pill>}
                      </td>
                      <td>{nameOf(p.money)}</td>
                      <td className={`${classes.num} ${p.isVoid ? "" : p.direction === "in" ? classes.positive : classes.negative}`}>
                        <span dir="ltr">
                          {p.direction === "out" ? "−" : "+"}
                          {f.money(p.amount)}
                        </span>
                      </td>
                      <td>
                        {canWrite && !p.isVoid && (
                          <div className={fin.rowActions}>
                            <button type="button" className={fin.bad} onClick={() => voidIt(p)}>
                              {t("finVoid")}
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
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
  );
};

// ---------------------------------------------------------------- cheques

// deposited (2026-10, the treasury's cheque moves) moves on like pending
const MOVES: Record<string, string[]> = { pending: ["cleared", "bounced", "returned"], deposited: ["cleared", "bounced", "returned"], bounced: ["cleared", "returned"] };

const ChequeStatusForm = ({ p, to, onDone }: { p: FinPayment; to: string; onDone: () => unknown }) => {
  const t = useFinText();
  const { api } = useFin();
  const { close } = useFinPopup();
  const pushNotification = useNotification();
  const { data: money } = useMoneyAccounts();
  const banks = asArray<FinMoney>(money).filter((a) => a.isActive && (a.kind === "bank" || a.kind === "cash"));
  const [bank, setBank] = useState("");
  const [date, setDate] = useState<Date>(new Date());
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const pick = banks.find((b) => b._id === bank) ? bank : banks[0]?._id || "";
  const save = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await fetcher({
        url: `${API}${api}/cheques/${p._id}/status`,
        method: "POST",
        payload: { status: to, money: to === "cleared" ? pick : undefined, date: isoDay(date), note: note.trim() || undefined },
      });
      pushNotification(t("bizSaved"), "Success");
      close(CHQ_KEY);
      onDone();
    } catch (err) {
      pushNotification((err as Error)?.message || String(err), "Error");
      setBusy(false);
    }
  };
  return (
    <PopupCard title={`${t(statusKey(to))} · ${p.cheque?.number || ""}`}>
      <div className={classes.popup}>
        <p className={classes.muted}>{t(`finChqHint${cap(to)}`)}</p>
        <div className={classes.form}>
          {to === "cleared" && (
            <label className={classes.field}>
              <span>{t(p.direction === "in" ? "finChqDepositTo" : "bizPaidFrom")}</span>
              <select value={pick} onChange={(e) => setBank(e.target.value)}>
                {banks.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </label>
          )}
          <div className={classes.field}>
            <DateInput title={t("bizDate")} defaultValue={date} onChange={(d) => setDate(d)} />
          </div>
          <label className={`${classes.field} ${classes.wide}`}>
            <span>{t("finNote")}</span>
            <input value={note} maxLength={300} onChange={(e) => setNote(e.target.value)} />
          </label>
        </div>
        <div className={classes.actions}>
          <button type="button" className={classes.ghost} onClick={() => close(CHQ_KEY)}>
            {t("bizCancel")}
          </button>
          <button type="button" className={to === "cleared" ? classes.primary : classes.danger} disabled={busy || (to === "cleared" && !pick)} onClick={save}>
            {t(statusKey(to))}
          </button>
        </div>
      </div>
    </PopupCard>
  );
};

type ChequeList = { items: FinPayment[]; pendingIn: number; pendingOut: number; overdueIn: number; bouncedIn: number };

// the cheque register; the treasury page adds its own moves (deposit,
// endorse, undo the last move) through extra (2026-10)
export const Cheques = ({ extra }: { extra?: (p: FinPayment, refresh: () => unknown) => ReactNode } = {}) => {
  const t = useFinText();
  const f = useBizFormat();
  const { api, canWrite } = useFin();
  const { open } = useFinPopup();
  const [direction, setDirection] = useState<"in" | "out">("in");
  const [status, setStatus] = useState("pending");
  const { data, error, mutate } = useSWR<ChequeList>(`${API}${api}/cheques?direction=${direction}${status ? `&status=${status}` : ""}`, (url: string) =>
    fetcher({ url }).then((res) => res.data as ChequeList),
  );
  const rows = asArray<FinPayment>(data?.items);
  const now = Date.now();
  return (
    <>
      <div className={classes.tiles}>
        <div className={classes.tile}>
          <span className={classes.tileLabel}>{t("finChqPendingIn")}</span>
          <span className={classes.tileValue}>
            {f.money(data?.pendingIn)}
            <span className={classes.tileUnit}>{t("toman")}</span>
          </span>
        </div>
        <div className={classes.tile}>
          <span className={classes.tileLabel}>{t("finChqPendingOut")}</span>
          <span className={classes.tileValue}>
            {f.money(data?.pendingOut)}
            <span className={classes.tileUnit}>{t("toman")}</span>
          </span>
        </div>
        <div className={classes.tile}>
          <span className={classes.tileLabel}>{t("finChqOverdue")}</span>
          <span className={`${classes.tileValue} ${(data?.overdueIn || 0) > 0 ? classes.negative : ""}`}>
            {f.money(data?.overdueIn)}
            <span className={classes.tileUnit}>{t("toman")}</span>
          </span>
        </div>
        <div className={classes.tile}>
          <span className={classes.tileLabel}>{t("finChqBouncedIn")}</span>
          <span className={`${classes.tileValue} ${(data?.bouncedIn || 0) > 0 ? classes.negative : ""}`}>
            {f.money(data?.bouncedIn)}
            <span className={classes.tileUnit}>{t("toman")}</span>
          </span>
        </div>
      </div>
      <section className={classes.card}>
        <div className={classes.cardHead}>
          <div className={classes.segmented} role="tablist">
            {(["in", "out"] as const).map((d) => (
              <button key={d} type="button" role="tab" aria-selected={direction === d} className={direction === d ? classes.on : ""} onClick={() => setDirection(d)}>
                {t(d === "in" ? "finChqReceivedList" : "finChqIssuedList")}
              </button>
            ))}
          </div>
          <select className={classes.ghost} value={status} onChange={(e) => setStatus(e.target.value)} aria-label={t("status")}>
            <option value="">{t("finAll")}</option>
            {["pending", "deposited", "cleared", "bounced", "returned", "endorsed"].map((s) => (
              <option key={s} value={s}>
                {t(statusKey(s))}
              </option>
            ))}
          </select>
        </div>
        <p className={classes.muted}>{t("finChqReminderNote")}</p>
        <HandleLoading data={!!data} error={error}>
          {!!data &&
            (rows.length === 0 ? (
              <p className={classes.empty}>{t("finNoCheques")}</p>
            ) : (
              <div className={classes.tableWrap}>
                <table className={classes.table}>
                  <thead>
                    <tr>
                      <th>{t("finChqDue")}</th>
                      <th>{t("finChqNumber")}</th>
                      <th>{t("finChqBank")}</th>
                      <th>{t("finParty")}</th>
                      <th className={classes.num}>{t("bizAmount")}</th>
                      <th>{t("status")}</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((p) => {
                      const overdue = p.cheque?.status === "pending" && new Date(p.cheque.dueDate).getTime() < now;
                      return (
                        <tr key={p._id}>
                          <td>
                            {f.date(p.cheque?.dueDate)} {overdue && <Pill status="overdue">{t("finOverdue")}</Pill>}
                          </td>
                          <td dir="ltr">
                            {p.cheque?.number}
                            {p.cheque?.sayad ? <span className={fin.small}> · {p.cheque.sayad}</span> : null}
                          </td>
                          <td>{p.cheque?.bank}</td>
                          <td className={classes.wrap}>{p.party || "—"}</td>
                          <td className={classes.num}>{f.money(p.amount)}</td>
                          <td>{p.cheque && <Pill status={p.cheque.status}>{t(statusKey(p.cheque.status))}</Pill>}</td>
                          <td>
                            {canWrite && (
                              <div className={fin.rowActions}>
                                {(MOVES[p.cheque?.status || ""] || []).map((to) => (
                                  <button
                                    key={to}
                                    type="button"
                                    className={to === "cleared" ? "" : fin.bad}
                                    onClick={() => open(CHQ_KEY, <ChequeStatusForm p={p} to={to} onDone={() => mutate()} />)}
                                  >
                                    {t(`finChqTo${cap(to)}`)}
                                  </button>
                                ))}
                                {extra?.(p, () => mutate())}
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ))}
        </HandleLoading>
      </section>
    </>
  );
};

// ------------------------------------------------- tills and bank accounts

const MoneyForm = ({ account, onDone }: { account?: FinMoney; onDone: () => unknown }) => {
  const t = useFinText();
  const { api } = useFin();
  const { close } = useFinPopup();
  const pushNotification = useNotification();
  const [kind, setKind] = useState<"cash" | "bank" | "pos">(account?.kind === "cash" || account?.kind === "pos" ? account.kind : "bank");
  const [name, setName] = useState(account?.name || "");
  const [bankName, setBankName] = useState(account?.bankName || "");
  const [accountNumber, setAccountNumber] = useState(account?.accountNumber || "");
  const [sheba, setSheba] = useState(account?.sheba || "");
  const [isActive, setIsActive] = useState(account?.isActive ?? true);
  const [busy, setBusy] = useState(false);
  const system = !!account?.role;
  const save = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await fetcher({
        url: account ? `${API}${api}/money/${account._id}` : `${API}${api}/money`,
        method: account ? "PATCH" : "POST",
        payload: {
          ...(account ? {} : { kind }),
          ...(system ? {} : { name: name.trim() }),
          bankName: bankName.trim() || undefined,
          accountNumber: accountNumber.trim() || undefined,
          sheba: sheba.replace(/\s/g, "").toUpperCase() || undefined,
          ...(account && account.kind !== "wallet" ? { isActive } : {}),
        },
      });
      pushNotification(t("bizSaved"), "Success");
      close(MONEY_KEY);
      onDone();
    } catch (err) {
      pushNotification((err as Error)?.message || String(err), "Error");
      setBusy(false);
    }
  };
  return (
    <PopupCard title={account ? account.name : t("finAddTill")}>
      <div className={classes.popup}>
        {!account && (
          <div className={classes.segmented} role="tablist">
            {(["bank", "cash", "pos"] as const).map((k) => (
              <button key={k} type="button" role="tab" aria-selected={kind === k} className={kind === k ? classes.on : ""} onClick={() => setKind(k)}>
                {t(moneyKindKey(k))}
              </button>
            ))}
          </div>
        )}
        <div className={classes.form}>
          {!system && (
            <label className={`${classes.field} ${classes.wide}`}>
              <span>{t("finTillName")}</span>
              <input value={name} maxLength={120} onChange={(e) => setName(e.target.value)} placeholder={t("finTillNameHint")} />
            </label>
          )}
          {(account?.kind || kind) !== "cash" && account?.kind !== "wallet" && (
            <>
              <label className={classes.field}>
                <span>{t("finBankName")}</span>
                <input value={bankName} maxLength={80} onChange={(e) => setBankName(e.target.value)} />
              </label>
              <label className={classes.field}>
                <span>{t("finAccountNumber")}</span>
                <input value={accountNumber} maxLength={40} dir="ltr" onChange={(e) => setAccountNumber(e.target.value)} />
              </label>
              <label className={classes.field}>
                <span>{t("finSheba")}</span>
                <input value={sheba} maxLength={34} dir="ltr" placeholder="IR…" onChange={(e) => setSheba(e.target.value)} />
              </label>
            </>
          )}
          {!!account && account.kind !== "wallet" && (
            <label className={`${fin.check} ${classes.wide}`}>
              <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
              {t("finTillActive")}
            </label>
          )}
        </div>
        <div className={classes.actions}>
          <button type="button" className={classes.ghost} onClick={() => close(MONEY_KEY)}>
            {t("bizCancel")}
          </button>
          <button type="button" className={classes.primary} disabled={busy || (!system && name.trim().length < 2)} onClick={save}>
            {t("bizSave")}
          </button>
        </div>
      </div>
    </PopupCard>
  );
};

type Lines = {
  account: { _id: string; name: string; statementBalance?: number; statementDate?: string };
  lines: { _id: string; number: number; date: string; description: string; label?: string; amount: number; reconciled: boolean }[];
};

// Simple bank reconciliation: tick the lines the bank statement shows; the
// cleared balance is compared with the statement's.
const Reconcile = ({ account, onDone }: { account: FinMoney; onDone: () => unknown }) => {
  const t = useFinText();
  const f = useBizFormat();
  const { api, canWrite } = useFin();
  const pushNotification = useNotification();
  const { data, error, mutate } = useSWR<Lines>(`${API}${api}/money/${account._id}/lines`, (url: string) => fetcher({ url }).then((res) => res.data as Lines));
  const [statement, setStatement] = useState(account.statementBalance !== undefined ? String(account.statementBalance) : "");
  const [busy, setBusy] = useState(false);
  const lines = asArray<Lines["lines"][number]>(data?.lines);
  const cleared = lines.filter((l) => l.reconciled).reduce((s, l) => s + l.amount, 0);
  const book = lines.reduce((s, l) => s + l.amount, 0);
  const diff = statement ? parseAmount(statement) * (statement.trim().startsWith("-") ? -1 : 1) - cleared : 0;
  const toggle = async (ids: string[], value: boolean, withStatement = false) => {
    if (busy || !canWrite) return;
    setBusy(true);
    try {
      await fetcher({
        url: `${API}${api}/money/${account._id}/reconcile`,
        method: "POST",
        payload: {
          vouchers: ids,
          cleared: value,
          ...(withStatement && statement ? { statementBalance: parseAmount(statement), statementDate: isoDay(new Date()) } : {}),
        },
      });
      await mutate();
      if (withStatement) pushNotification(t("bizSaved"), "Success");
      onDone();
    } catch (err) {
      pushNotification((err as Error)?.message || String(err), "Error");
    } finally {
      setBusy(false);
    }
  };
  return (
    <PopupCard title={`${t("finReconcile")} · ${account.name}`}>
      <div className={classes.popup}>
        <p className={classes.muted}>{t("finReconcileHint")}</p>
        <div className={classes.form}>
          <label className={classes.field}>
            <span>{t("finStatementBalance")}</span>
            <input value={statement} dir="ltr" inputMode="numeric" onChange={(e) => setStatement(e.target.value)} />
          </label>
          <div className={fin.summaryBar}>
            <span>
              {t("finBookBalance")}: <b>{f.signed(book)}</b>
            </span>
            <span>
              {t("finClearedBalance")}: <b>{f.signed(cleared)}</b>
            </span>
            {!!statement && (
              <span>
                {t("finDifference")}: <b className={Math.abs(diff) < 1 ? classes.positive : classes.negative}>{f.signed(diff)}</b>
              </span>
            )}
          </div>
        </div>
        <HandleLoading data={!!data} error={error}>
          {lines.length === 0 ? (
            <p className={classes.empty}>{t("bizEmpty")}</p>
          ) : (
            <div className={classes.tableWrap} style={{ maxHeight: "50vh" }}>
              <table className={classes.table}>
                <thead>
                  <tr>
                    <th />
                    <th>{t("bizDate")}</th>
                    <th>{t("bizDescription")}</th>
                    <th className={classes.num}>{t("bizAmount")}</th>
                  </tr>
                </thead>
                <tbody>
                  {lines.map((l) => (
                    <tr key={`${l._id}${l.label}${l.amount}`}>
                      <td>
                        <input
                          type="checkbox"
                          aria-label={t("finCleared")}
                          checked={l.reconciled}
                          disabled={!canWrite || busy}
                          onChange={(e) => toggle([l._id], e.target.checked)}
                        />
                      </td>
                      <td>{f.date(l.date)}</td>
                      <td className={classes.wrap}>{l.label || l.description}</td>
                      <td className={`${classes.num} ${l.amount < 0 ? classes.negative : classes.positive}`}>{f.signed(l.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </HandleLoading>
        {canWrite && (
          <div className={classes.actions}>
            <button type="button" className={classes.primary} disabled={busy || !statement} onClick={() => toggle([], true, true)}>
              {t("finSaveStatement")}
            </button>
          </div>
        )}
      </div>
    </PopupCard>
  );
};

const Accounts = () => {
  const t = useFinText();
  const f = useBizFormat();
  const { canWrite } = useFin();
  const { open } = useFinPopup();
  const { data, error, mutate } = useMoneyAccounts();
  const rows = asArray<FinMoney>(data);
  return (
    <section className={classes.card}>
      <div className={classes.cardHead}>
        <span className={classes.cardTitle}>{t("finTills")}</span>
        {canWrite && (
          <button type="button" className={classes.primary} onClick={() => open(MONEY_KEY, <MoneyForm onDone={() => mutate()} />)}>
            {t("finAddTill")}
          </button>
        )}
      </div>
      <HandleLoading data={!!data} error={error}>
        <div className={classes.tableWrap}>
          <table className={classes.table}>
            <thead>
              <tr>
                <th>{t("finTillName")}</th>
                <th>{t("finKind")}</th>
                <th>{t("finBankName")}</th>
                <th className={classes.num}>{t("bizBalance")}</th>
                <th className={classes.num}>{t("finClearedBalance")}</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((a) => (
                <tr key={a._id} className={a.isActive ? "" : fin.small}>
                  <td className={classes.wrap}>
                    {a.name}
                    {a.sheba ? (
                      <span className={fin.small} dir="ltr">
                        {" "}
                        · {a.sheba}
                      </span>
                    ) : null}
                  </td>
                  <td>{t(moneyKindKey(a.kind))}</td>
                  <td>{a.bankName || "—"}</td>
                  <td className={`${classes.num} ${a.balance < 0 ? classes.negative : ""}`}>{f.signed(a.balance)}</td>
                  <td className={classes.num}>{a.kind === "bank" || a.kind === "pos" ? f.signed(a.cleared) : "—"}</td>
                  <td>
                    <div className={fin.rowActions}>
                      {(a.kind === "bank" || a.kind === "pos") && (
                        <button type="button" onClick={() => open(REC_KEY, <Reconcile account={a} onDone={() => mutate()} />)}>
                          {t("finReconcile")}
                        </button>
                      )}
                      {canWrite && a.kind !== "wallet" && (
                        <button type="button" onClick={() => open(MONEY_KEY, <MoneyForm account={a} onDone={() => mutate()} />)}>
                          {t("bizEdit")}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </HandleLoading>
      <p className={classes.muted}>{t("finTillsHint")}</p>
    </section>
  );
};

const Body = () => {
  const t = useFinText();
  const view = useTabParam("entries");
  return (
    <ClientTabSystem
      viewState={view}
      items={[
        { id: "entries", title: t("finTabEntries"), content: <Entries /> },
        { id: "cheques", title: t("finTabCheques"), content: <Cheques /> },
        { id: "accounts", title: t("finTabTills"), content: <Accounts /> },
      ]}
    />
  );
};

// «مالی و حسابداری» → دریافت و پرداخت (2026-10): every receipt and payment
// with its method (cash, card reader, transfer, cheque, Noyan wallet), the
// cheque register with due dates and bounces, and the tills and bank
// accounts with a simple reconciliation. Each entry is a voucher.
const FinancePayments = ({ node, panel }: { node: NodeWithAcl; panel: string }) => (
  <FinanceShell node={node} panel={panel} title="finPaymentsTitle" subtitle="finPaymentsSubtitle" segment="payments">
    <Body />
  </FinanceShell>
);

export default FinancePayments;
