"use client";

import { useState } from "react";
import usePopup from "@/Components/Hooks/usePopup";
import PopupCard from "@/Components/UI/PopupCard";
import Table from "@/Components/Admin/UI/Table";
import TableActions from "@/Components/Admin/UI/TableActions";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import ClientTabSystem from "@/Components/UI/ClientTabSystem";
import Link from "@/Components/i18n/Link";
import classes from "../Accounting.module.css";
import crm from "../Crm/Crm.module.css";
import { useBizFormat } from "../bizShared";
import { CrmContext, useCrm } from "../Crm/crmShared";
import { Approval, ApprovalKind, approvalStatusKey, ApprovalStatus, contactName, Plan, SalesMeta, useAction, useList, useNames, useProfile, useSalesMeta, useSalesText } from "./salesShared";
import { ContactChoice, ContactPicker } from "./SalesWidgets";
import { DiscountRequest } from "./SalesPlan";

const DECIDE = "CrmsDecide";
const NEW_REQ = "CrmsNewRequest";

const RejectForm = ({ onDone }: { onDone: (note: string) => void }) => {
  const t = useSalesText();
  const { closePopup } = usePopup();
  const [note, setNote] = useState("");
  return (
    <PopupCard title={t("crmsReject")}>
      <div className={classes.popup}>
        <label className={classes.field}>
          {t("crmsRejectReason")}
          <textarea value={note} onChange={(e) => setNote(e.target.value)} autoFocus />
        </label>
        <div className={classes.actions}>
          <button
            type="button"
            className={classes.danger}
            disabled={!note.trim()}
            onClick={() => {
              closePopup(DECIDE);
              onDone(note.trim());
            }}
          >
            {t("crmsReject")}
          </button>
        </div>
      </div>
    </PopupCard>
  );
};

const CreditRequest = ({ onDone }: { onDone: () => void }) => {
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
const PickDiscountTarget = ({ onPick }: { onPick: (target: { plan?: string; invoice?: string }) => void }) => {
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

const ApprovalList = ({ kind, meta }: { kind: ApprovalKind; meta?: SalesMeta }) => {
  const t = useSalesText();
  const f = useBizFormat();
  const names = useNames();
  const ctx = useCrm();
  const { panel, canWrite } = ctx;
  const { setPopup } = usePopup();
  const { run, busy } = useAction();
  const [status, setStatus] = useState<"" | ApprovalStatus>("pending");
  const { data, error, mutate } = useList<Approval>(`/approvals?kind=${kind}${status ? `&status=${status}` : ""}`);
  const me = meta?.me;
  const top = meta?.ownerUser;
  const decide = async (a: Approval, decision: "approved" | "rejected", note?: string) => {
    if (await run("POST", `/approvals/${a._id}/decide`, { decision, note })) mutate();
  };
  const withCtx = (n: React.ReactNode) => <CrmContext.Provider value={ctx}>{n}</CrmContext.Provider>;
  const newRequest = () => {
    if (kind === "credit") setPopup(NEW_REQ, withCtx(<CreditRequest onDone={() => mutate()} />));
    else if (kind === "discount")
      setPopup(
        NEW_REQ,
        withCtx(<PickDiscountTarget onPick={(target) => setPopup("CrmsPlanDiscount", withCtx(<DiscountRequest {...target} onDone={() => mutate()} />))} />),
      );
  };
  const target = (a: Approval) =>
    a.plan && typeof a.plan === "object" ? (
      <Link href={`${panel}/crm/plans/${a.plan._id}`} className={crm.linkButton}>
        {t("crmsPlanN", [f.money(a.plan.number)])} · {a.plan.subject}
      </Link>
    ) : a.invoice && typeof a.invoice === "object" ? (
      <>{t("crmsInvoiceN", [f.money(a.invoice.number), f.money(a.invoice.total)])}</>
    ) : (
      <>{contactName(a.contact)}</>
    );
  return (
    <section className={classes.card}>
      <div className={classes.cardHead}>
        <div className={classes.segmented} role="tablist">
          {(["pending", "applied", "approved", "rejected", "cancelled", ""] as const).map((x) => (
            <button key={x || "all"} type="button" role="tab" aria-selected={status === x} className={status === x ? classes.on : ""} onClick={() => setStatus(x)}>
              {t(x ? approvalStatusKey[x] : "crmsAllStatuses")}
            </button>
          ))}
        </div>
        {canWrite && kind !== "plan" && (
          <button type="button" className={classes.primary} onClick={newRequest}>
            {t(kind === "credit" ? "crmsAskCredit" : "crmsAskDiscount")}
          </button>
        )}
      </div>
      {kind === "plan" && <p className={classes.muted}>{t("crmsPlanApprovalHint")}</p>}
      <HandleLoading data={!!data} error={error}>
        {data && !data.length ? (
          <p className={classes.empty}>{t("crmsNoRequests")}</p>
        ) : (
          <Table<Approval>
            data={data || []}
            name={`CrmSalesApprovals_${kind}`}
            renderer={{
              number: { name: t("crmsNumber"), filter: "Number", value: (a) => a.number },
              target: { name: t(kind === "credit" ? "crmsPatient" : "crmsFor"), value: (a) => contactName(a.contact), component: target },
              amount: {
                name: t(kind === "credit" ? "crmsRequestedLimit" : kind === "plan" ? "crmsTotal" : "crmsDiscount"),
                filter: "Number",
                value: (a) => (kind === "credit" ? a.requestedLimit : a.amount),
                component: (a) => <>{kind === "credit" ? f.money(a.requestedLimit) : a.percent ? `${f.money(a.percent)}%` : f.money(a.amount)}</>,
              },
              description: { name: t("crmsReason"), value: (a) => a.description || "" },
              requester: { name: t("crmsRequester"), filter: "Set", value: (a) => names.staff(meta, a.requester) },
              waiting: { name: t("crmsWaitingFor"), value: (a) => (a.status === "pending" ? names.staff(meta, a.chain[a.level]) : "—") },
              createdAt: { name: t("crmsDate"), filter: "Date", value: (a) => new Date(a.createdAt) },
              status: {
                name: t("crmsStatus"),
                filter: "Set",
                value: (a) => t(approvalStatusKey[a.status]) + (a.decisions.length && a.decisions[a.decisions.length - 1].note ? ` · ${a.decisions[a.decisions.length - 1].note}` : ""),
              },
              ...(canWrite
                ? {
                    actions: {
                      name: "",
                      width: 240,
                      component: (a) => {
                        const mine = a.status === "pending" && (me === a.chain[a.level] || me === top);
                        return (
                          <TableActions>
                            {mine && (
                              <>
                                <button type="button" className={crm.linkButton} disabled={!!busy} onClick={() => decide(a, "approved")}>
                                  {t("crmsApprove")}
                                </button>
                                <button type="button" className={crm.linkDanger} disabled={!!busy} onClick={() => setPopup(DECIDE, <RejectForm onDone={(note) => decide(a, "rejected", note)} />)}>
                                  {t("crmsReject")}
                                </button>
                              </>
                            )}
                            {a.status === "pending" && (me === a.requester || me === top) && (
                              <button
                                type="button"
                                className={crm.linkButton}
                                disabled={!!busy}
                                onClick={async () => {
                                  if (await run("POST", `/approvals/${a._id}/cancel`, {})) mutate();
                                }}
                              >
                                {t("crmsCancelRequest")}
                              </button>
                            )}
                            {a.status === "approved" && (
                              <button
                                type="button"
                                className={crm.linkButton}
                                disabled={!!busy}
                                onClick={async () => {
                                  if (await run("POST", `/approvals/${a._id}/apply`, {})) mutate();
                                }}
                              >
                                {t("crmsApplyAgain")}
                              </button>
                            )}
                          </TableActions>
                        );
                      },
                    },
                  }
                : {}),
            }}
          />
        )}
      </HandleLoading>
    </section>
  );
};

// Requests waiting for the centre manager (Nexxa proforma-approvals,
// discount-requests, credit-limit-requests): each walks its approval chain
// one person at a time, and the last approval applies it.
const SalesApprovals = () => {
  const t = useSalesText();
  const pf = useProfile();
  const { data: meta } = useSalesMeta();
  return (
    <ClientTabSystem
      items={(["plan", "discount", "credit"] as const)
        .filter((k) => pf.approvals.includes(k))
        .map((k) => ({ id: k, title: t(`crmsApKind_${k}`), content: <ApprovalList kind={k} meta={meta} /> }))}
    />
  );
};

export default SalesApprovals;
