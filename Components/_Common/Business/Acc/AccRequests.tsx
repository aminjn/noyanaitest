"use client";

import { useState } from "react";
import usePopup from "@/Components/Hooks/usePopup";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import DateInput from "@/Components/UI/DateInput";
import { NodeWithAcl } from "@/Components/_Common/SecretaryManager/Request/CreateSecretaryRequestPopup";
import classes from "../Accounting.module.css";
import fin from "../Finance/Finance.module.css";
import acc from "./Acc.module.css";
import { asArray, BizAccount, isoDay, useBiz, useBizFormat } from "../bizShared";
import { useBizAccounts } from "../AccountingSummary";
import CostCenterSelect from "../CostCenterSelect";
import FinanceShell from "../Finance/FinanceShell";
import { parseAmount } from "../Finance/finShared";
import { AccountSelect, AccParty, AmountInput, ConfirmButton, MoneySelect, PartyPicker, SimplePopup, SubNav, useAccCall, useAccGet, useAccPopup, useAccText, useView } from "./accShared";

// «کارتابل مالی» (2026-10), a port of Nexxa's petty-cash, expense, payment,
// cheque-issue, fund-transfer, return and invoice-approval requests: a team
// member asks, the chosen approvers decide one after another, the last
// approval books it (or «اجرا» does, when it could not run by itself).

type Req = {
  _id: string;
  kind: string;
  number: number;
  requesterName?: string;
  requester?: string;
  amount: number;
  description?: string;
  status: "pending" | "approved" | "rejected" | "cancelled" | "done";
  chainNames: string[];
  level: number;
  decisions: { name?: string; decision: string; note?: string; at: string }[];
  partyName?: string;
  serial?: string;
  dueDate?: string;
  error?: string;
  myTurn?: boolean;
  createdAt: string;
};
type Member = { _id: string; name: string; owner?: boolean };

const KINDS = ["petty", "expense", "payment", "checkIssue", "fundTransfer", "return", "invoice"] as const;
type Kind = (typeof KINDS)[number];

const RequestForm = ({ kind, onDone }: { kind: Kind; onDone: () => unknown }) => {
  const t = useAccText();
  const call = useAccCall();
  const { closePopup } = usePopup();
  const { data: accounts } = useBizAccounts();
  const { data: team } = useAccGet<Member[]>("/acc/team", (d) => asArray<Member>(d));
  const { data: drafts } = useAccGet<{ _id: string; number: number; party?: { name?: string }; total: number }[]>(kind === "invoice" ? "/finance/invoices?status=draft&limit=100" : null, (d) =>
    asArray<{ _id: string; number: number; party?: { name?: string }; total: number }>((d as { items?: unknown })?.items),
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
  const [invoiceRef, setInvoiceRef] = useState("");
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
      invoiceRef,
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
        {kind === "return" && <PartyPicker value={party} onChange={setParty} label={t("accParty")} kinds={["patient", "person", "custom"]} />}
        {kind === "return" && (
          <label className={classes.field}>
            <span>{t("accInvoiceRef")}</span>
            <input value={invoiceRef} onChange={(e) => setInvoiceRef(e.target.value)} />
          </label>
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
        {kind === "invoice" && (
          <label className={classes.field}>
            <span>{t("accDraftInvoice")}</span>
            <select value={invoice} onChange={(e) => setInvoice(e.target.value)}>
              <option value="">{t("bizSelect")}</option>
              {asArray<{ _id: string; number: number; party?: { name?: string }; total: number }>(drafts).map((i) => (
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
        <button type="button" className={classes.primary} disabled={kind === "invoice" ? !invoice : !parseAmount(amt)} onClick={save}>
          {t("accSubmitRequest")}
        </button>
      </div>
    </SimplePopup>
  );
};

const DecideForm = ({ r, onDone }: { r: Req; onDone: () => unknown }) => {
  const t = useAccText();
  const call = useAccCall();
  const { closePopup } = usePopup();
  const [note, setNote] = useState("");
  const decide = async (decision: "approved" | "rejected") => {
    if (await call(`/acc/requests/${r._id}/decide`, "POST", { decision, note })) {
      closePopup();
      onDone();
    }
  };
  return (
    <SimplePopup title={`${t(`accReq_${r.kind}`)} #${r.number}`}>
      <label className={classes.field}>
        <span>{t("accNote")}</span>
        <input value={note} onChange={(e) => setNote(e.target.value)} />
      </label>
      <div className={classes.actions}>
        <button type="button" className={classes.danger} disabled={!note.trim()} onClick={() => decide("rejected")}>
          {t("accReject")}
        </button>
        <button type="button" className={classes.primary} onClick={() => decide("approved")}>
          {t("accApprove")}
        </button>
      </div>
      <p className={acc.mutedSmall}>{t("accRejectNeedsReason")}</p>
    </SimplePopup>
  );
};

const tone = (s: string) => ({ pending: fin.toneInfo, approved: fin.toneWarn, done: fin.toneOk, rejected: fin.toneBad, cancelled: fin.toneMuted })[s] || fin.toneMuted;

const Body = () => {
  const t = useAccText();
  const f = useBizFormat();
  const { canApprove } = useBiz();
  const call = useAccCall();
  const { open } = useAccPopup();
  const [view, setView] = useView(["mine", ...KINDS] as const, "mine");
  const [status, setStatus] = useState("");
  const kindQ = view === "mine" ? "" : view;
  const { data, error, mutate } = useAccGet<{ items: Req[]; counts: { kind: string; status: string; n: number }[]; isOwner: boolean; me: string }>(
    `/acc/requests?${new URLSearchParams({ ...(kindQ ? { kind: kindQ } : {}), ...(status ? { status } : {}) })}`,
    (d) => {
      const x = (d || {}) as { items?: unknown; counts?: unknown; isOwner?: boolean; me?: string };
      return { items: asArray<Req>(x.items), counts: asArray<{ kind: string; status: string; n: number }>(x.counts), isOwner: !!x.isOwner, me: String(x.me || "") };
    },
  );
  const items = asArray<Req>(data?.items).filter((r) => view !== "mine" || r.myTurn || (data?.isOwner && r.status === "pending") || (r.status === "approved" && (r.requester === data?.me || data?.isOwner)));
  const pending = (k: string) => asArray<{ kind: string; status: string; n: number }>(data?.counts).filter((c) => c.kind === k && c.status === "pending").reduce((s, c) => s + c.n, 0);
  return (
    <section className={classes.card}>
      <SubNav value={view} onChange={setView} items={[["mine", t("accMyDesk")], ...KINDS.map((k) => [k, `${t(`accReq_${k}`)}${pending(k) ? ` (${f.money(pending(k))})` : ""}`] as [Kind, string])]} />
      <div className={acc.bar}>
        <div className={classes.filters}>
          <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label={t("accState")}>
            <option value="">{t("accAllStates")}</option>
            {["pending", "approved", "done", "rejected", "cancelled"].map((s) => (
              <option key={s} value={s}>
                {t(`accReqSt_${s}`)}
              </option>
            ))}
          </select>
        </div>
        {view !== "mine" && (
          <button type="button" className={classes.primary} onClick={() => open("AccRequestForm", <RequestForm kind={view as Kind} onDone={() => mutate()} />)}>
            {t("accNewRequest")}
          </button>
        )}
      </div>
      <HandleLoading data={!!data} error={error}>
        <div className={classes.tableWrap}>
          <table className={classes.table}>
            <thead>
              <tr>
                <th>{t("bizNumber")}</th>
                <th>{t("accRequestKind")}</th>
                <th>{t("accRequester")}</th>
                <th>{t("bizDescription")}</th>
                <th className={classes.num}>{t("bizAmount")}</th>
                <th>{t("accState")}</th>
                <th>{t("accApprovers")}</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {!items.length && (
                <tr>
                  <td colSpan={8} className={classes.empty}>
                    {t("bizEmpty")}
                  </td>
                </tr>
              )}
              {items.map((r) => (
                <tr key={r._id}>
                  <td>{f.money(r.number)}</td>
                  <td>{t(`accReq_${r.kind}`)}</td>
                  <td>{r.requesterName || "—"}</td>
                  <td className={classes.wrap}>
                    {[r.partyName, r.description].filter(Boolean).join(" · ") || "—"}
                    {!!r.error && <div className={classes.statusBad}>{r.error}</div>}
                    {asArray<Req["decisions"][number]>(r.decisions).map((d, i) => (
                      <div key={i} className={acc.mutedSmall}>
                        {d.name}: {t(d.decision === "approved" ? "accApproved" : "accRejected")} {d.note ? `— ${d.note}` : ""}
                      </div>
                    ))}
                  </td>
                  <td className={classes.num}>{f.money(r.amount)}</td>
                  <td>
                    <span className={`${fin.pill} ${tone(r.status)}`}>{t(`accReqSt_${r.status}`)}</span>
                  </td>
                  <td className={classes.wrap}>{asArray<string>(r.chainNames).map((n, i) => (i === r.level && r.status === "pending" ? `▸${n}` : n)).join(" ← ") || t("accNoApprovers")}</td>
                  <td>
                    <div className={fin.rowActions}>
                      {r.status === "pending" && canApprove && (r.myTurn || data?.isOwner) && (
                        <button type="button" onClick={() => open("AccDecide", <DecideForm r={r} onDone={() => mutate()} />)}>
                          {t("accDecide")}
                        </button>
                      )}
                      {r.status === "approved" && canApprove && (
                        <button type="button" onClick={async () => (await call(`/acc/requests/${r._id}/execute`, "POST", {}, t("accExecuted"))) && mutate()}>
                          {t("accExecute")}
                        </button>
                      )}
                      {(r.status === "pending" || r.status === "approved") && (r.requester === data?.me || data?.isOwner) && (
                        <ConfirmButton danger label={t("bizCancel")} confirm={t("accCancelRequestConfirm")} onConfirm={async () => (await call(`/acc/requests/${r._id}/cancel`, "POST", {})) && mutate()} />
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </HandleLoading>
    </section>
  );
};

const AccRequests = ({ node, panel }: { node: NodeWithAcl; panel: string }) => (
  <FinanceShell node={node} panel={panel} title="accRequestsTitle" subtitle="accRequestsSubtitle" segment="requests">
    <Body />
  </FinanceShell>
);

export default AccRequests;
