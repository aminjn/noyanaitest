"use client";

import { useState } from "react";
import usePopup from "@/Components/Hooks/usePopup";
import PopupCard from "@/Components/UI/PopupCard";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import Table from "@/Components/Admin/UI/Table";
import classes from "../../Accounting.module.css";
import s from "./Service.module.css";
import { useBizFormat } from "../../bizShared";
import { CrmContext, CrmTeamMember, useCrmTeam } from "../crmShared";
import { Badge, ConfirmButton, ContactField, listOf, Ref, useCall, useCrm, useCrmText, useGet, useMine, useTeamName } from "./svc";

// «مرجوعی و استرداد» (2026-10), nexxacrm's crm/service-returns and
// crm/after-sales-returns: a service complaint refunded in cash or as a
// credit note, or (a pharmacy, a lab) returned goods refunded, repaired or
// replaced from stock. It goes through the chosen approvers in order (the
// inbox); "process" books it, "void" books the reverse. A visit or order
// paid with the Noyan wallet is refunded through Noyan's dispute flow.

type Kind = "service" | "goods";
type Action = "refund" | "credit" | "repair" | "replace";
type Status = "pending" | "approved" | "processed" | "rejected" | "cancelled" | "voided";
type Return = {
  _id: string;
  number: number;
  kind: Kind;
  action: Action;
  amount: number;
  payFrom: "cash" | "bank";
  reason?: string;
  status: Status;
  approverChain: string[];
  currentLevel: number;
  requester: string;
  rejectReason?: string;
  createdAt: string;
  contact?: { _id: string; name?: string; phone: string } | null;
  invoice?: { _id: string; number: number; total: number } | null;
  item?: { _id: string; name: string } | null;
};
const ACTIONS: Record<Kind, Action[]> = { service: ["refund", "credit"], goods: ["refund", "repair", "replace"] };
const actionKey: Record<Action, string> = { refund: "crmeRetRefund", credit: "crmeRetCredit", repair: "crmeRetRepair", replace: "crmeRetReplace" };
const statusKey: Record<Status, string> = {
  pending: "crmeRetPending",
  approved: "crmeRetApproved",
  processed: "crmeRetProcessed",
  rejected: "crmeRetRejected",
  cancelled: "crmeRetCancelled",
  voided: "crmeRetVoided",
};
const tone = (st: Status) => (st === "processed" ? "ok" : st === "approved" || st === "pending" ? "warn" : st === "rejected" ? "bad" : "muted");

const NewReturn = ({ goods, onDone }: { goods: boolean; onDone: () => unknown }) => {
  const t = useCrmText();
  const f = useBizFormat();
  const call = useCall();
  const { closePopup } = usePopup();
  const { data: team } = useCrmTeam();
  const [kind, setKind] = useState<Kind>("service");
  const [action, setAction] = useState<Action>("refund");
  const [contact, setContact] = useState<Ref>(null);
  const [q, setQ] = useState("");
  const [invoice, setInvoice] = useState("");
  const [item, setItem] = useState("");
  const [amount, setAmount] = useState("");
  const [payFrom, setPayFrom] = useState<"cash" | "bank">("cash");
  const [reason, setReason] = useState("");
  const [approvers, setApprovers] = useState<string[]>([]);
  const look = useGet<{ invoices: { _id: string; number: number; total: number; party?: { name?: string } }[]; items: { _id: string; name: string }[] } | null>(
    `/returns/lookups?q=${encodeURIComponent(q.trim())}`,
    (d) => (d && typeof d === "object" ? (d as never) : null),
  );
  const save = async () => {
    if (
      await call("POST", "/returns", {
        kind,
        action,
        contact: contact?._id || null,
        invoice: invoice || null,
        item: item || null,
        amount: Number(amount) || 0,
        payFrom,
        reason: reason || null,
        approvers,
      })
    ) {
      closePopup("CrmeReturn");
      onDone();
    }
  };
  const members = listOf<CrmTeamMember>(team);
  return (
    <PopupCard title={t("crmeNewReturn")}>
      <div className={classes.popup}>
        <p className={s.hint}>{t("crmeReturnDisputeHint")}</p>
        <div className={s.stepFields}>
          {goods && (
            <label className={classes.field}>
              {t("crmeReturnKind")}
              <select
                value={kind}
                onChange={(e) => {
                  const k = e.target.value as Kind;
                  setKind(k);
                  setAction(ACTIONS[k][0]);
                }}
              >
                <option value="service">{t("crmeRetService")}</option>
                <option value="goods">{t("crmeRetGoods")}</option>
              </select>
            </label>
          )}
          <label className={classes.field}>
            {t("crmeReturnAction")}
            <select value={action} onChange={(e) => setAction(e.target.value as Action)}>
              {ACTIONS[kind].map((a) => (
                <option key={a} value={a}>
                  {t(actionKey[a])}
                </option>
              ))}
            </select>
          </label>
          <div className={s.wideField}>
            <ContactField value={contact} onChange={setContact} />
          </div>
          <label className={classes.field}>
            {t("crmeInvoiceSearch")}
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("crmeInvoiceSearchHint")} />
          </label>
          <label className={classes.field}>
            {t("crmeInvoice")}
            <select value={invoice} onChange={(e) => setInvoice(e.target.value)}>
              <option value="">—</option>
              {listOf<{ _id: string; number: number; total: number; party?: { name?: string } }>(look.data?.invoices).map((i) => (
                <option key={i._id} value={i._id}>
                  {t("crmeInvoiceN", [f.year(i.number)])} · {i.party?.name || ""} · {f.money(i.total)}
                </option>
              ))}
            </select>
          </label>
          {action === "replace" && (
            <label className={classes.field}>
              {t("crmeReplaceItem")}
              <select value={item} onChange={(e) => setItem(e.target.value)}>
                <option value="">—</option>
                {listOf<{ _id: string; name: string }>(look.data?.items).map((i) => (
                  <option key={i._id} value={i._id}>
                    {i.name}
                  </option>
                ))}
              </select>
            </label>
          )}
          {action !== "replace" && (
            <label className={classes.field}>
              {t("bizAmount")}
              <input type="number" min={0} dir="ltr" value={amount} onChange={(e) => setAmount(e.target.value)} />
            </label>
          )}
          {(action === "refund" || action === "repair") && (
            <label className={classes.field}>
              {t("crmePayFrom")}
              <select value={payFrom} onChange={(e) => setPayFrom(e.target.value as "cash" | "bank")}>
                <option value="cash">{t("crmeCash")}</option>
                <option value="bank">{t("crmeBank")}</option>
              </select>
            </label>
          )}
          <label className={`${classes.field} ${s.wideField}`}>
            {t("crmeReason")}
            <textarea rows={2} value={reason} onChange={(e) => setReason(e.target.value)} maxLength={1000} />
          </label>
          <div className={`${classes.field} ${s.wideField}`}>
            <span>{t("crmeApprovers")}</span>
            <span className={s.hint}>{t("crmeApproversHint")}</span>
            <div className={s.row}>
              {members.map((m) => (
                <label key={m._id} className={s.row}>
                  <input
                    type="checkbox"
                    checked={approvers.includes(m._id)}
                    onChange={(e) => setApprovers((x) => (e.target.checked ? [...x, m._id] : x.filter((y) => y !== m._id)))}
                  />
                  {m.name}
                  {approvers.includes(m._id) ? ` (${approvers.indexOf(m._id) + 1})` : ""}
                </label>
              ))}
            </div>
          </div>
        </div>
        <div className={classes.actions}>
          <button type="button" className={classes.ghost} onClick={() => closePopup("CrmeReturn")}>
            {t("bizCancel")}
          </button>
          <button
            type="button"
            className={classes.primary}
            disabled={(!contact && !invoice) || (action === "replace" ? !item : !(Number(amount) > 0))}
            onClick={save}
          >
            {t("bizSave")}
          </button>
        </div>
      </div>
    </PopupCard>
  );
};

const CrmReturns = () => {
  const t = useCrmText();
  const f = useBizFormat();
  const ctx = useCrm();
  const { canWrite } = ctx;
  const call = useCall();
  const nameOf = useTeamName();
  const mine = useMine();
  const { setPopup } = usePopup();
  const [status, setStatus] = useState("");
  const { data, error, mutate } = useGet<Return[]>(`/returns${status ? `?status=${status}` : ""}`, (d) => listOf<Return>(d));
  const act = async (id: string, what: "process" | "void" | "cancel") => (await call("POST", `/returns/${id}/${what}`)) && mutate();
  return (
    <section className={classes.card}>
      <div className={classes.cardHead}>
        <div className={classes.segmented} role="tablist">
          {["", "pending", "approved", "processed", "voided"].map((st) => (
            <button key={st || "all"} type="button" role="tab" aria-selected={status === st} className={status === st ? classes.on : ""} onClick={() => setStatus(st)}>
              {t(st ? statusKey[st as Status] : "all")}
            </button>
          ))}
        </div>
        {canWrite && (
          <button type="button" className={classes.primary} onClick={() => setPopup("CrmeReturn", <CrmContext.Provider value={ctx}><NewReturn goods={!!mine.data?.goods} onDone={() => mutate()} /></CrmContext.Provider>)}>
            {t("crmeNewReturn")}
          </button>
        )}
      </div>
      <p className={s.hint}>{t("crmeReturnsHint")}</p>
      <HandleLoading data={!!data} error={error}>
        {!!data &&
          (!data.length ? (
            <p className={classes.empty}>{t("crmeNoReturns")}</p>
          ) : (
            <Table
              data={data}
              name="CrmReturns"
              renderer={{
                number: { name: "#", value: (r) => r.number, filter: "Number" },
                contact: { name: t("crmName"), value: (r) => r.contact?.name || r.contact?.phone || "" },
                action: { name: t("crmeReturnAction"), value: (r) => t(actionKey[r.action]), filter: "Set" },
                amount: { name: t("bizAmount"), value: (r) => r.amount, filter: "Number", component: (r) => (r.action === "replace" ? r.item?.name || "—" : f.money(r.amount)) },
                invoice: { name: t("crmeInvoice"), value: (r) => (r.invoice ? r.invoice.number : "") },
                status: {
                  name: t("crmeStatus"),
                  value: (r) => t(statusKey[r.status]),
                  filter: "Set",
                  component: (r) => (
                    <span className={s.row}>
                      <Badge tone={tone(r.status)}>{t(statusKey[r.status])}</Badge>
                      {r.status === "pending" && r.approverChain?.[r.currentLevel] && <span className={classes.muted}>{t("crmeWaitingFor", [nameOf(r.approverChain[r.currentLevel])])}</span>}
                    </span>
                  ),
                },
                reason: { name: t("crmeReason"), value: (r) => r.rejectReason || r.reason || "" },
                createdAt: { name: t("bizDate"), value: (r) => new Date(r.createdAt), filter: "Date" },
                actions: {
                  name: t("crmeActions"),
                  // room for «انجام (ثبت سند)» and «لغو» (and the confirm step) side by side
                  width: 290,
                  component: (r) =>
                    canWrite ? (
                      <span className={s.row}>
                        {r.status === "approved" && (
                          <ConfirmButton className={classes.primary} onConfirm={() => act(r._id, "process")}>
                            {t("crmeProcess")}
                          </ConfirmButton>
                        )}
                        {r.status === "processed" && <ConfirmButton onConfirm={() => act(r._id, "void")}>{t("crmeVoid")}</ConfirmButton>}
                        {(r.status === "pending" || r.status === "approved") && <ConfirmButton onConfirm={() => act(r._id, "cancel")}>{t("crmCancel")}</ConfirmButton>}
                      </span>
                    ) : null,
                },
              }}
            />
          ))}
      </HandleLoading>
    </section>
  );
};

export default CrmReturns;
