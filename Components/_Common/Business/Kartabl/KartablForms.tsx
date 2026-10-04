"use client";

import { useState } from "react";
import usePopup from "@/Components/Hooks/usePopup";
import PopupCard from "@/Components/UI/PopupCard";
import DateInput from "@/Components/UI/DateInput";
import classes from "../Accounting.module.css";
import acc from "../Acc/Acc.module.css";
import { asArray, BizAccount, isoDay, useBizFormat } from "../bizShared";
import { useBizAccounts } from "../AccountingSummary";
import CostCenterSelect from "../CostCenterSelect";
import { parseAmount } from "../Finance/finShared";
import { AccountSelect, AccParty, AmountInput, MoneySelect, PartyPicker, SimplePopup, useAccCall, useAccGet, useAccText } from "../Acc/accShared";
import { Plan, useAction, useList, useSalesText } from "../CrmSales/salesShared";
import { ContactChoice, ContactPicker } from "../CrmSales/SalesWidgets";

// The forms that file a request into the panel's «کارتابل» (2026-10,
// Kartabl.tsx): the finance kinds (Nexxa's petty-cash, expense, payment,
// cheque-issue, fund-transfer and invoice-approval requests, and a return
// of an issued invoice - booked by the returns flow), and the CRM sales
// ones (a discount on a plan or a draft invoice, a patient's credit limit).
// Finance forms read the accounting context (BizContext), sales ones the
// CRM's (CrmContext); Kartabl.tsx provides both.

export const FINANCE_KINDS = ["petty", "expense", "payment", "checkIssue", "fundTransfer", "invoice", "return"] as const;
export type FinanceKind = (typeof FINANCE_KINDS)[number];
type Member = { _id: string; name: string; owner?: boolean };
type Inv = { _id: string; number: number; party?: { name?: string }; total: number };
export const NEW_REQ = "KartablNewRequest";

export const FinanceRequestForm = ({ kind, onDone }: { kind: FinanceKind; onDone: () => unknown }) => {
  const t = useAccText();
  const call = useAccCall();
  const { closePopup } = usePopup();
  const { data: accounts } = useBizAccounts();
  const { data: team } = useAccGet<Member[]>("/acc/team", (d) => asArray<Member>(d));
  // a draft to issue, or an issued invoice to return
  const { data: drafts } = useAccGet<Inv[]>(kind === "invoice" || kind === "return" ? `/finance/invoices?status=${kind === "invoice" ? "draft" : "issued"}&limit=100` : null, (d) =>
    asArray<Inv>((d as { items?: unknown })?.items),
  );
  const [amt, setAmt] = useState("");
  const [description, setDescription] = useState("");
  const [money, setMoney] = useState("");
  const [toMoney, setToMoney] = useState("");
  const [account, setAccount] = useState("");
  const [center, setCenter] = useState("");
  const [party, setParty] = useState<AccParty | null>(null);
  const [serial, setSerial] = useState("");
  const [bank, setBank] = useState("");
  const [due, setDue] = useState<Date | null>(null);
  const [invoice, setInvoice] = useState("");
  const [returnAction, setReturnAction] = useState<"credit" | "refund">("credit");
  const [payFrom, setPayFrom] = useState<"cash" | "bank">("cash");
  const [payKind, setPayKind] = useState<"payment" | "remittance">("payment");
  const [approvers, setApprovers] = useState<string[]>([]);
  const save = async () => {
    const res = await call("/acc/requests", "POST", {
      kind,
      amount: parseAmount(amt),
      description,
      approvers,
      money: money || undefined,
      toMoney: toMoney || undefined,
      account: account || undefined,
      center: center || undefined,
      party: party?._id,
      partyName: party?.name,
      payKind,
      serial,
      bank,
      dueDate: due ? isoDay(due) : undefined,
      invoice: invoice || undefined,
      ...(kind === "return" ? { returnAction, payFrom } : {}),
    });
    if (res) {
      closePopup();
      onDone();
    }
  };
  return (
    <SimplePopup title={t(`accReq_${kind}`)}>
      <p className={classes.muted}>{t(`accReqHint_${kind}`)}</p>
      <div className={classes.form}>
        {kind !== "invoice" && <AmountInput label={t("bizAmount")} value={amt} onChange={setAmt} />}
        {kind === "petty" && <MoneySelect value={toMoney} onChange={setToMoney} kinds={["petty"]} label={t("accKindPetty")} />}
        {(kind === "petty" || kind === "fundTransfer" || kind === "expense" || kind === "payment") && (
          <MoneySelect value={money} onChange={setMoney} label={kind === "fundTransfer" ? t("accFrom") : t("accPayFrom")} exclude={toMoney} />
        )}
        {kind === "fundTransfer" && <MoneySelect value={toMoney} onChange={setToMoney} label={t("accTo")} exclude={money} />}
        {kind === "expense" && <AccountSelect accounts={asArray<BizAccount>(accounts).filter((a) => a.type === "expense")} value={account} onChange={setAccount} label={t("finExpenseKind")} />}
        {kind === "expense" && <CostCenterSelect value={center} onChange={setCenter} />}
        {(kind === "payment" || kind === "checkIssue") && <PartyPicker value={party} onChange={setParty} label={t("accPayee")} kinds={["supplier", "person", "doctor", "custom"]} />}
        {kind === "return" && (
          <>
            <label className={classes.field}>
              <span>{t("crmeReturnAction")}</span>
              <select value={returnAction} onChange={(e) => setReturnAction(e.target.value as "credit")}>
                <option value="credit">{t("crmeRetCredit")}</option>
                <option value="refund">{t("crmeRetRefund")}</option>
              </select>
            </label>
            {returnAction === "refund" && (
              <label className={classes.field}>
                <span>{t("crmePayFrom")}</span>
                <select value={payFrom} onChange={(e) => setPayFrom(e.target.value as "cash")}>
                  <option value="cash">{t("crmeCash")}</option>
                  <option value="bank">{t("crmeBank")}</option>
                </select>
              </label>
            )}
          </>
        )}
        {kind === "payment" && (
          <label className={classes.field}>
            <span>{t("accPayKind")}</span>
            <select value={payKind} onChange={(e) => setPayKind(e.target.value as "payment")}>
              <option value="payment">{t("accPayKindPayment")}</option>
              <option value="remittance">{t("accPayKindRemittance")}</option>
            </select>
          </label>
        )}
        {kind === "checkIssue" && (
          <>
            <MoneySelect value={money} onChange={setMoney} kinds={["bank"]} />
            <label className={classes.field}>
              <span>{t("finChqNumber")}</span>
              <input value={serial} dir="ltr" onChange={(e) => setSerial(e.target.value)} />
            </label>
            <label className={classes.field}>
              <span>{t("finChqBank")}</span>
              <input value={bank} onChange={(e) => setBank(e.target.value)} />
            </label>
            <div className={classes.field}>
              <DateInput title={t("finChqDue")} onChange={(x) => setDue(x)} onClear={() => setDue(null)} />
            </div>
          </>
        )}
        {(kind === "invoice" || kind === "return") && (
          <label className={classes.field}>
            <span>{t(kind === "invoice" ? "accDraftInvoice" : "kartablIssuedInvoice")}</span>
            <select value={invoice} onChange={(e) => setInvoice(e.target.value)}>
              <option value="">{t("bizSelect")}</option>
              {asArray<Inv>(drafts).map((i) => (
                <option key={i._id} value={i._id}>
                  #{i.number} · {i.party?.name || ""}
                </option>
              ))}
            </select>
          </label>
        )}
        <label className={`${classes.field} ${classes.wide}`}>
          <span>{t("bizDescription")}</span>
          <input value={description} maxLength={500} onChange={(e) => setDescription(e.target.value)} />
        </label>
      </div>
      <div className={classes.field}>
        <span>{t("accApprovers")}</span>
        <div className={acc.checks}>
          {asArray<Member>(team).map((m) => (
            <label key={m._id}>
              <input type="checkbox" checked={approvers.includes(m._id)} onChange={(e) => setApprovers((p) => (e.target.checked ? [...p, m._id] : p.filter((x) => x !== m._id)))} />
              {m.name}
              {approvers.includes(m._id) ? ` (${approvers.indexOf(m._id) + 1})` : ""}
            </label>
          ))}
        </div>
        <span className={acc.mutedSmall}>{t("accApproversHint")}</span>
      </div>
      <div className={classes.actions}>
        <button type="button" className={classes.ghost} onClick={() => closePopup()}>
          {t("bizCancel")}
        </button>
        <button type="button" className={classes.primary} disabled={kind === "invoice" ? !invoice : !parseAmount(amt) || (kind === "return" && !invoice)} onClick={save}>
          {t("accSubmitRequest")}
        </button>
      </div>
    </SimplePopup>
  );
};

// ---------------------------------------------------------------- sales

export const CreditRequest = ({ onDone }: { onDone: () => void }) => {
  const t = useSalesText();
  const { closePopup } = usePopup();
  const { run, busy } = useAction();
  const [who, setWho] = useState<ContactChoice>({});
  const [limit, setLimit] = useState("");
  const [description, setDescription] = useState("");
  return (
    <PopupCard title={t("crmsAskCredit")}>
      <div className={classes.popup}>
        <ContactPicker value={who} onChange={setWho} allowNew={false} />
        <label className={classes.field}>
          {t("crmsRequestedLimit")}
          <input inputMode="numeric" value={limit} onChange={(e) => setLimit(e.target.value.replace(/\D/g, ""))} />
        </label>
        <label className={classes.field}>
          {t("crmsReason")}
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
        </label>
        <div className={classes.actions}>
          <button
            type="button"
            className={classes.primary}
            disabled={!!busy || !who.contact || !(Number(limit) > 0)}
            onClick={async () => {
              if (await run("POST", "/approvals", { kind: "credit", contact: who.contact?._id, requestedLimit: Number(limit), description })) {
                closePopup(NEW_REQ);
                onDone();
              }
            }}
          >
            {t("crmsSendRequest")}
          </button>
        </div>
      </div>
    </PopupCard>
  );
};

// a discount starts from a plan or a draft invoice
export const PickDiscountTarget = ({ onPick }: { onPick: (target: { plan?: string; invoice?: string }) => void }) => {
  const t = useSalesText();
  const f = useBizFormat();
  const { closePopup } = usePopup();
  const { data: plans } = useList<Plan>("/plans");
  const { data: invoices } = useList<{ _id: string; number: number; party?: { name?: string }; total: number }>("/approvals/draft-invoices");
  const [v, setV] = useState("");
  const open = (plans || []).filter((p) => !p.invoice && p.status !== "accepted" && p.approval?.status !== "pending");
  return (
    <PopupCard title={t("crmsAskDiscount")}>
      <div className={classes.popup}>
        <label className={classes.field}>
          {t("crmsDiscountFor")}
          <select value={v} onChange={(e) => setV(e.target.value)}>
            <option value="">—</option>
            {open.length > 0 && (
              <optgroup label={t("crmsNavPlans")}>
                {open.map((p) => (
                  <option key={p._id} value={`plan:${p._id}`}>
                    {f.money(p.number)} · {p.subject} · {f.money(p.total)}
                  </option>
                ))}
              </optgroup>
            )}
            {(invoices || []).length > 0 && (
              <optgroup label={t("crmsDraftInvoices")}>
                {(invoices || []).map((i) => (
                  <option key={i._id} value={`invoice:${i._id}`}>
                    {f.money(i.number)} · {i.party?.name || "—"} · {f.money(i.total)}
                  </option>
                ))}
              </optgroup>
            )}
          </select>
        </label>
        <div className={classes.actions}>
          <button
            type="button"
            className={classes.primary}
            disabled={!v}
            onClick={() => {
              const [k, id] = v.split(":");
              closePopup(NEW_REQ);
              onPick(k === "plan" ? { plan: id } : { invoice: id });
            }}
          >
            {t("crmsNext")}
          </button>
        </div>
      </div>
    </PopupCard>
  );
};

