"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import useNotification from "@/Components/Hooks/useNotification";
import usePopup from "@/Components/Hooks/usePopup";
import PopupCard from "@/Components/UI/PopupCard";
import DateInput from "@/Components/UI/DateInput";
import classes from "../Accounting.module.css";
import fin from "./Finance.module.css";
import { asArray, isoDay, useBiz, useBizFormat } from "../bizShared";
import { useBizAccounts } from "../AccountingSummary";
import { FinMoney, methodKey, moneyKindKey, parseAmount, useFin, useFinText, useMoneyAccounts } from "./finShared";

const METHODS = ["cash", "card", "transfer", "cheque", "wallet"] as const;
type Method = (typeof METHODS)[number];

// which tills a method pays through: cash the till, a card the POS (or the
// bank it settles to), a transfer the bank, the wallet the Noyan wallet; a
// cheque clears into a bank later
const fits = (m: Method, a: FinMoney) =>
  m === "cash" ? a.kind === "cash" : m === "card" ? a.kind === "pos" || a.kind === "bank" : m === "transfer" || m === "cheque" ? a.kind === "bank" : a.kind === "wallet";

export const POPUP_KEY = "FinPaymentForm";
const isChequeMethod = (m: Method) => m === "cheque";

// One receipt or payment (2026-10, «دریافت و پرداخت»): against an invoice,
// an insurance claim or an expense - opened from that document with its
// open amount - or free, against any account (rent paid, a loan received).
// A cheque takes its number, bank, Sayad id and due date and is booked to
// «اسناد دریافتنی / پرداختنی» until it clears.
const PaymentForm = ({
  direction,
  against,
  docId,
  open,
  party: initialParty,
  title,
  onDone,
}: {
  direction: "in" | "out";
  against: "invoice" | "claim" | "expense" | "account";
  docId?: string;
  open?: number;
  party?: string;
  title?: string;
  onDone: () => unknown;
}) => {
  const t = useFinText();
  const f = useBizFormat();
  const { api } = useFin();
  const popup = usePopup();
  const close = () => popup.closePopup(POPUP_KEY);
  const pushNotification = useNotification();
  const { data: money } = useMoneyAccounts();
  const { data: accounts } = useBizAccounts();
  const [method, setMethod] = useState<Method>("cash");
  const [amount, setAmount] = useState(open ? String(Math.max(0, Math.round(open))) : "");
  const [date, setDate] = useState<Date>(new Date());
  const [moneyId, setMoneyId] = useState<string | null>(null);
  const [account, setAccount] = useState("");
  const [party, setParty] = useState(initialParty || "");
  const [description, setDescription] = useState("");
  const [reference, setReference] = useState("");
  const [cheque, setCheque] = useState({ number: "", bank: "", sayad: "", dueDate: new Date(), checkbook: "" });
  const [busy, setBusy] = useState(false);
  // (2026-10) a cheque paid out is a leaf of one of the chequebooks
  // (treasury → cheques → chequebooks): its next number and bank fill in
  const { api: bizApi } = useBiz();
  type Book = { _id: string; serial: string; bankName?: string; money?: string; nextNo?: string; isActive?: boolean };
  const { data: booksData } = useSWR<Book[]>(direction === "out" && method === "cheque" && bizApi ? `${API}${bizApi}/acc/checkbooks` : null, (url: string) =>
    fetcher({ url })
      .then((res) => asArray<Book>(res.data).filter((b) => b && b._id && b.isActive !== false && b.nextNo))
      .catch(() => []),
  );
  const books = asArray<Book>(booksData);
  const pickBook = (id: string) => {
    const b = books.find((x) => x._id === id);
    setCheque((c) => ({ ...c, checkbook: id, number: b?.nextNo || (id ? c.number : ""), bank: b?.bankName || c.bank }));
    if (b?.money) setMoneyId(b.money);
  };

  const tills = useMemo(() => (Array.isArray(money) ? money : []).filter((a) => a.isActive && fits(method, a)), [method, money]);
  // a cheque may be deposited later ("" picked on purpose)
  const selected = isChequeMethod(method) && moneyId === "" ? "" : tills.find((a) => a._id === moneyId) ? moneyId! : tills[0]?._id || "";
  // a free receipt or payment: any detail account but the tills themselves
  const counters = useMemo(
    () =>
      (Array.isArray(accounts) ? accounts : []).filter(
        (a) => a.level === "detail" && a.parentCode !== "11" && (direction === "in" ? a.type !== "expense" : a.type !== "income"),
      ),
    [accounts, direction],
  );
  const value = parseAmount(amount);
  const tooMuch = open !== undefined && value > open + 0.5;
  const isCheque = method === "cheque";
  const ready =
    value > 0 &&
    !tooMuch &&
    (isCheque ? cheque.number.trim() && cheque.bank.trim() : !!selected) &&
    (against !== "account" || (!!account && description.trim().length >= 2));

  const save = async () => {
    if (busy || !ready) return;
    setBusy(true);
    try {
      await fetcher({
        url: `${API}${api}/payments`,
        method: "POST",
        payload: {
          direction,
          against,
          [against]: against === "account" ? account : docId,
          amount: value,
          date: isoDay(date),
          method,
          money: selected || undefined,
          party: party.trim() || undefined,
          description: description.trim() || undefined,
          reference: reference.trim() || undefined,
          cheque: isCheque
            ? {
                number: cheque.number.trim(),
                bank: cheque.bank.trim(),
                sayad: cheque.sayad.trim() || undefined,
                dueDate: isoDay(cheque.dueDate),
                checkbook: direction === "out" && cheque.checkbook ? cheque.checkbook : undefined,
              }
            : undefined,
        },
      });
      pushNotification(t("bizSaved"), "Success");
      close();
      onDone();
    } catch (err) {
      pushNotification((err as Error)?.message || String(err), "Error");
      setBusy(false);
    }
  };

  return (
    <PopupCard title={title || t(direction === "in" ? "finNewReceipt" : "finNewPayment")}>
      <div className={classes.popup}>
        {open !== undefined && (
          <p className={classes.muted}>
            {t("finOpenAmount")}: <b>{f.money(open)}</b> {t("toman")}
          </p>
        )}
        <div className={classes.segmented} role="tablist" aria-label={t("finMethod")}>
          {METHODS.map((m) => (
            <button key={m} type="button" role="tab" aria-selected={method === m} className={method === m ? classes.on : ""} onClick={() => setMethod(m)}>
              {t(methodKey(m))}
            </button>
          ))}
        </div>
        <div className={classes.form}>
          <label className={classes.field}>
            <span>{t("bizAmount")}</span>
            <input inputMode="numeric" dir="ltr" value={amount} onChange={(e) => setAmount(e.target.value)} aria-invalid={tooMuch} />
            {!!value && <span className={fin.small}>{f.money(value)} {t("toman")}</span>}
          </label>
          <div className={classes.field}>
            <DateInput title={t("bizDate")} defaultValue={date} onChange={(d) => setDate(d)} />
          </div>
          <label className={classes.field}>
            <span>{t(isCheque ? "finChqDepositTo" : direction === "in" ? "bizReceivedIn" : "bizPaidFrom")}</span>
            <select value={selected} onChange={(e) => setMoneyId(e.target.value)}>
              {isCheque && <option value="">{t("finChqDepositLater")}</option>}
              {!isCheque && !tills.length && <option value="">{t("finNoTill")}</option>}
              {tills.map((a) => (
                <option key={a._id} value={a._id}>
                  {a.name} · {t(moneyKindKey(a.kind))}
                </option>
              ))}
            </select>
          </label>
          {against === "account" && (
            <label className={classes.field}>
              <span>{t(direction === "in" ? "finReceivedFor" : "finPaidFor")}</span>
              <select value={account} onChange={(e) => setAccount(e.target.value)}>
                <option value="">{t("bizSelect")}</option>
                {counters.map((a) => (
                  <option key={a._id} value={a._id}>
                    {a.code} · {a.name}
                  </option>
                ))}
              </select>
            </label>
          )}
          <label className={classes.field}>
            <span>{t(direction === "in" ? "finPayer" : "finPayee")}</span>
            <input value={party} maxLength={200} onChange={(e) => setParty(e.target.value)} />
          </label>
          {!isCheque && (
            <label className={classes.field}>
              <span>{t("finReference")}</span>
              <input value={reference} maxLength={80} dir="ltr" onChange={(e) => setReference(e.target.value)} />
            </label>
          )}
          {isCheque && (
            <>
              {direction === "out" && books.length > 0 && (
                <label className={classes.field}>
                  <span>{t("finChqBook")}</span>
                  <select value={cheque.checkbook} onChange={(e) => pickBook(e.target.value)}>
                    <option value="">{t("finChqNoBook")}</option>
                    {books.map((b) => (
                      <option key={b._id} value={b._id}>
                        {[b.bankName, b.serial].filter(Boolean).join(" · ")}
                      </option>
                    ))}
                  </select>
                </label>
              )}
              <label className={classes.field}>
                <span>{t("finChqNumber")}</span>
                <input value={cheque.number} maxLength={40} dir="ltr" inputMode="numeric" onChange={(e) => setCheque({ ...cheque, number: e.target.value })} />
              </label>
              <label className={classes.field}>
                <span>{t("finChqBank")}</span>
                <input value={cheque.bank} maxLength={80} onChange={(e) => setCheque({ ...cheque, bank: e.target.value })} />
              </label>
              <label className={classes.field}>
                <span>{t("finChqSayad")}</span>
                <input value={cheque.sayad} maxLength={16} dir="ltr" inputMode="numeric" onChange={(e) => setCheque({ ...cheque, sayad: e.target.value.replace(/\D/g, "") })} />
              </label>
              <div className={classes.field}>
                <DateInput title={t("finChqDue")} defaultValue={cheque.dueDate} onChange={(d) => setCheque((c) => ({ ...c, dueDate: d }))} />
              </div>
            </>
          )}
          <label className={`${classes.field} ${classes.wide}`}>
            <span>{t("bizDescription")}</span>
            <input value={description} maxLength={500} onChange={(e) => setDescription(e.target.value)} />
          </label>
        </div>
        {tooMuch && <p className={fin.notice}>{t("finTooMuch")}</p>}
        <div className={classes.actions}>
          <button type="button" className={classes.ghost} onClick={close}>
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

export default PaymentForm;
