"use client";

import { useState } from "react";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import Link from "@/Components/i18n/Link";
import classes from "../../Accounting.module.css";
import crm from "../Crm.module.css";
import s from "./Service.module.css";
import { Badge, listOf, useCall, useCrm, useCrmText, useGet, useMine, useTeamName, useWhen } from "./svc";

// «کارتابل» (2026-10), nexxacrm's requests/inbox and automation/approvals:
// what waits for the viewer's decision - a workflow's approval step, the
// current level of a return's approval chain. One-way: approve, or reject
// with a reason. The owner can see everyone's.

type Task = {
  _id: string;
  entityType: string;
  entityId: string;
  title: string;
  detail?: string;
  approver: string;
  status: "pending" | "approved" | "rejected" | "cancelled";
  note?: string;
  decidedAt?: string;
  createdAt: string;
};
const STATUSES = ["pending", "approved", "rejected", "any"] as const;
const statusKey: Record<string, string> = { pending: "crmeInPending", approved: "crmeInApproved", rejected: "crmeInRejected", cancelled: "crmeInCancelled", any: "all" };

const CrmInbox = () => {
  const t = useCrmText();
  const w = useWhen();
  const call = useCall();
  const nameOf = useTeamName();
  const { panel } = useCrm();
  const mine = useMine();
  const [status, setStatus] = useState<(typeof STATUSES)[number]>("pending");
  const [all, setAll] = useState(false);
  const [reason, setReason] = useState<Record<string, string>>({});
  const [rejecting, setRejecting] = useState("");
  const { data, error, mutate } = useGet<Task[]>(`/inbox?status=${status}&all=${all ? 1 : 0}`, (d) => listOf<Task>(d));
  const decide = async (id: string, decision: "approved" | "rejected") => {
    if (await call("POST", `/inbox/${id}/decide`, { decision, ...(decision === "rejected" ? { note: reason[id] || "" } : {}) })) {
      setRejecting("");
      mutate();
      mine.mutate();
    }
  };
  const linkOf = (k: Task) => (k.entityType === "return" ? `${panel}/crm/returns` : k.entityType === "flow" ? `${panel}/crm/flows` : "");
  return (
    <section className={classes.card}>
      <div className={classes.cardHead}>
        <div className={classes.segmented} role="tablist">
          {STATUSES.map((st) => (
            <button key={st} type="button" role="tab" aria-selected={status === st} className={status === st ? classes.on : ""} onClick={() => setStatus(st)}>
              {t(statusKey[st])}
            </button>
          ))}
        </div>
        {mine.data?.isOwner && (
          <label className={s.row}>
            <input type="checkbox" checked={all} onChange={(e) => setAll(e.target.checked)} />
            {t("crmeInboxAll")}
          </label>
        )}
      </div>
      <p className={s.hint}>{t("crmeInboxHint")}</p>
      <HandleLoading data={!!data} error={error}>
        {!!data &&
          (!data.length ? (
            <p className={classes.empty}>{t("crmeInboxEmpty")}</p>
          ) : (
            <ul className={crm.miniList}>
              {data.map((k) => (
                <li key={k._id} className={s.stack}>
                  <div className={s.between}>
                    <span className={s.stack}>
                      <span className={s.strong}>{k.title}</span>
                      <span className={classes.muted}>
                        {k.detail ? `${k.detail} · ` : ""}
                        {t(k.entityType === "return" ? "crmeInFromReturn" : "crmeInFromFlow")} · {w.at(k.createdAt)}
                        {all ? ` · ${nameOf(k.approver)}` : ""}
                      </span>
                      {k.note && <span className={classes.muted}>{t("crmeReasonN", [k.note])}</span>}
                    </span>
                    <span className={s.row}>
                      {linkOf(k) && (
                        <Link href={linkOf(k)} className={crm.linkButton}>
                          {t("crmeOpen")}
                        </Link>
                      )}
                      {k.status === "pending" ? (
                        <>
                          <button type="button" className={classes.primary} onClick={() => decide(k._id, "approved")}>
                            {t("crmeApprove")}
                          </button>
                          <button type="button" className={classes.ghost} onClick={() => setRejecting(rejecting === k._id ? "" : k._id)}>
                            {t("crmeReject")}
                          </button>
                        </>
                      ) : (
                        <Badge tone={k.status === "approved" ? "ok" : k.status === "rejected" ? "bad" : "muted"}>{t(statusKey[k.status])}</Badge>
                      )}
                    </span>
                  </div>
                  {rejecting === k._id && (
                    <div className={s.row}>
                      <input value={reason[k._id] || ""} onChange={(e) => setReason((r) => ({ ...r, [k._id]: e.target.value }))} placeholder={t("crmeRejectReason")} maxLength={500} />
                      <button type="button" className={crm.linkDanger} disabled={!(reason[k._id] || "").trim()} onClick={() => decide(k._id, "rejected")}>
                        {t("crmeConfirmReject")}
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          ))}
      </HandleLoading>
    </section>
  );
};

export default CrmInbox;
