"use client";

import { useState } from "react";
import usePopup from "@/Components/Hooks/usePopup";
import PopupCard from "@/Components/UI/PopupCard";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import Table from "@/Components/Admin/UI/Table";
import Link from "@/Components/i18n/Link";
import classes from "../../Accounting.module.css";
import crm from "../Crm.module.css";
import s from "./Service.module.css";
import { CrmContext } from "../crmShared";
import { useRouter } from "@/Components/i18n/navigation";
import { Badge, ConfirmButton, ContactField, listOf, phoneText, Ref, TeamOptions, useCall, useCrm, useCrmText, useGet, useTeamName, useWhen } from "./svc";

// «درخواست‌ها و شکایت‌های بیماران» (2026-10), nexxacrm's tickets: a
// patient's request to the centre (from their own panel, or opened by the
// desk), numbered, given to the least-loaded team member, with response
// and resolve deadlines by priority. A public reply reaches the patient
// (in-app and SMS); an internal note stays with the team.

export const TICKET_STATUSES = ["open", "pending", "resolved", "closed"] as const;
export const PRIORITIES = ["low", "normal", "high", "urgent"] as const;
export const CATEGORIES = ["question", "complaint", "billing", "result", "prescription", "other"] as const;
type Status = (typeof TICKET_STATUSES)[number];
type Priority = (typeof PRIORITIES)[number];
type Category = (typeof CATEGORIES)[number];
type Message = { _id: string; body: string; internal: boolean; fromPatient: boolean; author?: string; at: string };
type Ticket = {
  _id: string;
  number: number;
  subject: string;
  category: Category;
  priority: Priority;
  status: Status;
  contact?: { _id: string; name?: string; phone: string } | null;
  assignee?: string;
  responseDueAt?: string;
  resolveDueAt?: string;
  firstResponseAt?: string;
  resolvedAt?: string;
  lastMessageAt: string;
  messages?: Message[];
  breach: "none" | "response" | "resolve";
};

export const ticketStatusKey: Record<Status, string> = { open: "crmeTkOpen", pending: "crmeTkPending", resolved: "crmeTkResolved", closed: "crmeTkClosed" };
export const priorityKey: Record<Priority, string> = { low: "crmePrLow", normal: "crmePrNormal", high: "crmePrHigh", urgent: "crmePrUrgent" };
export const categoryKey: Record<Category, string> = {
  question: "crmeCatQuestion",
  complaint: "crmeCatComplaint",
  billing: "crmeCatBilling",
  result: "crmeCatResult",
  prescription: "crmeCatPrescription",
  other: "crmeCatOther",
};
const statusTone = (st: Status) => (st === "open" ? "warn" : st === "pending" ? undefined : st === "resolved" ? "ok" : "muted");

const NewTicket = ({ onDone }: { onDone: (id?: string) => unknown }) => {
  const t = useCrmText();
  const call = useCall();
  const { closePopup } = usePopup();
  const [contact, setContact] = useState<Ref>(null);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [priority, setPriority] = useState<Priority>("normal");
  const [category, setCategory] = useState<Category>("question");
  const [assignee, setAssignee] = useState("");
  const save = async () => {
    const r = await call<Ticket>("POST", "/tickets", { subject, body, priority, category, contact: contact?._id || null, assignee: assignee || null });
    if (r) {
      closePopup("CrmeTicket");
      onDone(r._id);
    }
  };
  return (
    <PopupCard title={t("crmeNewTicket")}>
      <div className={classes.popup}>
        <div className={s.stepFields}>
          <div className={s.wideField}>
            <ContactField value={contact} onChange={setContact} />
          </div>
          <label className={`${classes.field} ${s.wideField}`}>
            {t("crmeSubject")}
            <input value={subject} onChange={(e) => setSubject(e.target.value)} maxLength={200} />
          </label>
          <label className={classes.field}>
            {t("crmeCategory")}
            <select value={category} onChange={(e) => setCategory(e.target.value as Category)}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {t(categoryKey[c])}
                </option>
              ))}
            </select>
          </label>
          <label className={classes.field}>
            {t("crmePriority")}
            <select value={priority} onChange={(e) => setPriority(e.target.value as Priority)}>
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {t(priorityKey[p])}
                </option>
              ))}
            </select>
          </label>
          <label className={classes.field}>
            {t("crmAssignee")}
            <select value={assignee} onChange={(e) => setAssignee(e.target.value)}>
              <TeamOptions none="crmeAutoAssign" />
            </select>
          </label>
          <label className={`${classes.field} ${s.wideField}`}>
            {t("crmeMessage")}
            <textarea rows={4} value={body} onChange={(e) => setBody(e.target.value)} maxLength={5000} />
          </label>
        </div>
        <div className={classes.actions}>
          <button type="button" className={classes.ghost} onClick={() => closePopup("CrmeTicket")}>
            {t("bizCancel")}
          </button>
          <button type="button" className={classes.primary} disabled={subject.trim().length < 2 || body.trim().length < 2} onClick={save}>
            {t("bizSave")}
          </button>
        </div>
      </div>
    </PopupCard>
  );
};

const TicketList = () => {
  const t = useCrmText();
  const w = useWhen();
  const ctx = useCrm();
  const { panel, canWrite } = ctx;
  const router = useRouter();
  const nameOf = useTeamName();
  const { setPopup } = usePopup();
  const [status, setStatus] = useState<string>("active");
  const [mine, setMine] = useState(false);
  const [q, setQ] = useState("");
  const p = new URLSearchParams({ status, mine: mine ? "1" : "0" });
  if (q.trim()) p.set("q", q.trim());
  const { data, error, mutate } = useGet<Ticket[]>(`/tickets?${p}`, (d) => listOf<Ticket>(d));
  return (
    <section className={classes.card}>
      <div className={classes.cardHead}>
        <div className={classes.filters}>
          <div className={classes.segmented} role="tablist">
            {["active", ...TICKET_STATUSES, "all"].map((st) => (
              <button key={st} type="button" role="tab" aria-selected={status === st} className={status === st ? classes.on : ""} onClick={() => setStatus(st)}>
                {t(st === "active" ? "crmeTkActive" : st === "all" ? "all" : ticketStatusKey[st as Status])}
              </button>
            ))}
          </div>
          <label className={s.row}>
            <input type="checkbox" checked={mine} onChange={(e) => setMine(e.target.checked)} />
            {t("crmFuMine")}
          </label>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("crmeSearchTickets")} />
        </div>
        {canWrite && (
          <button
            type="button"
            className={classes.primary}
            onClick={() => setPopup("CrmeTicket", <CrmContext.Provider value={ctx}><NewTicket onDone={(id) => { mutate(); if (id) router.push(`${panel}/crm/tickets/${id}`); }} /></CrmContext.Provider>)}
          >
            {t("crmeNewTicket")}
          </button>
        )}
      </div>
      <HandleLoading data={!!data} error={error}>
        {!!data &&
          (!data.length ? (
            <p className={classes.empty}>{t("crmeNoTickets")}</p>
          ) : (
            <Table
              data={data}
              name="CrmTickets"
              renderer={{
                number: { name: "#", value: (k) => k.number, filter: "Number" },
                subject: { name: t("crmeSubject"), value: (k) => k.subject, filter: "Text", component: (k) => <Link href={`${panel}/crm/tickets/${k._id}`}>{k.subject}</Link> },
                contact: { name: t("crmName"), value: (k) => k.contact?.name || k.contact?.phone || "" },
                category: { name: t("crmeCategory"), value: (k) => t(categoryKey[k.category]), filter: "Set" },
                priority: { name: t("crmePriority"), value: (k) => t(priorityKey[k.priority]), filter: "Set" },
                status: {
                  name: t("crmeStatus"),
                  value: (k) => t(ticketStatusKey[k.status]),
                  filter: "Set",
                  component: (k) => (
                    <span className={s.row}>
                      <Badge tone={statusTone(k.status)}>{t(ticketStatusKey[k.status])}</Badge>
                      {k.breach !== "none" && <Badge tone="bad">{t(k.breach === "resolve" ? "crmeSlaResolve" : "crmeSlaResponse")}</Badge>}
                    </span>
                  ),
                },
                assignee: { name: t("crmAssignee"), value: (k) => nameOf(k.assignee), filter: "Set" },
                lastMessageAt: { name: t("crmeLastMessage"), value: (k) => new Date(k.lastMessageAt), filter: "Date", component: (k) => w.at(k.lastMessageAt) },
              }}
            />
          ))}
      </HandleLoading>
    </section>
  );
};

const TicketDetail = ({ id }: { id: string }) => {
  const t = useCrmText();
  const w = useWhen();
  const call = useCall();
  const router = useRouter();
  const nameOf = useTeamName();
  const { panel, canWrite } = useCrm();
  const { data, error, mutate } = useGet<Ticket | null>(`/tickets/${id}`, (d) => (d && typeof d === "object" ? (d as Ticket) : null));
  const [body, setBody] = useState("");
  const [internal, setInternal] = useState(false);
  const patch = async (payload: Record<string, unknown>) => (await call("PATCH", `/tickets/${id}`, payload)) && mutate();
  const reply = async () => {
    if (await call("POST", `/tickets/${id}/reply`, { body, internal })) {
      setBody("");
      mutate();
    }
  };
  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <div className={s.detail}>
          <section className={classes.card}>
            <div className={s.stack}>
              <Link href={`${panel}/crm/tickets`} className={crm.linkButton}>
                {t("back")}
              </Link>
              <h2 className={classes.cardTitle}>
                #{data.number} · {data.subject}
              </h2>
            </div>
            <div className={s.thread}>
              {listOf<Message>(data.messages).map((m) => (
                <div key={m._id} className={`${s.msg} ${m.internal ? s.msgInternal : !m.fromPatient ? s.msgMine : ""}`}>
                  {m.body}
                  <span className={s.msgMeta}>
                    {m.internal ? `${t("crmeInternalNote")} · ` : ""}
                    {m.fromPatient ? data.contact?.name || t("crmePatient") : nameOf(m.author) || t("crmeTeam")} · {w.at(m.at)}
                  </span>
                </div>
              ))}
            </div>
            {data.status !== "closed" && (
              <div className={s.stack}>
                <textarea rows={3} value={body} onChange={(e) => setBody(e.target.value)} maxLength={5000} placeholder={t(internal ? "crmeNotePlaceholder" : "crmeReplyPlaceholder")} />
                <div className={s.between}>
                  <label className={s.row}>
                    <input type="checkbox" checked={internal} onChange={(e) => setInternal(e.target.checked)} />
                    {t("crmeInternalNote")}
                  </label>
                  <button type="button" className={classes.primary} disabled={!body.trim()} onClick={reply}>
                    {t(internal ? "crmeAddNote" : "crmeSendReply")}
                  </button>
                </div>
              </div>
            )}
          </section>
          <aside className={classes.card}>
            <div className={s.stack}>
              {data.contact && (
                <Link href={`${panel}/crm/contacts/${data.contact._id}`} className={s.stack}>
                  <span className={s.strong}>{data.contact.name || "—"}</span>
                  <bdi dir="ltr" className={classes.muted}>
                    {phoneText(data.contact.phone)}
                  </bdi>
                </Link>
              )}
              <label className={classes.field}>
                {t("crmeStatus")}
                <select value={data.status} onChange={(e) => patch({ status: e.target.value })}>
                  {TICKET_STATUSES.map((st) => (
                    <option key={st} value={st}>
                      {t(ticketStatusKey[st])}
                    </option>
                  ))}
                </select>
              </label>
              <label className={classes.field}>
                {t("crmePriority")}
                <select value={data.priority} onChange={(e) => patch({ priority: e.target.value })}>
                  {PRIORITIES.map((p) => (
                    <option key={p} value={p}>
                      {t(priorityKey[p])}
                    </option>
                  ))}
                </select>
              </label>
              <label className={classes.field}>
                {t("crmeCategory")}
                <select value={data.category} onChange={(e) => patch({ category: e.target.value })}>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {t(categoryKey[c])}
                    </option>
                  ))}
                </select>
              </label>
              <label className={classes.field}>
                {t("crmAssignee")}
                <select value={data.assignee || ""} onChange={(e) => patch({ assignee: e.target.value || null })}>
                  <TeamOptions none="crmAssigneeNone" />
                </select>
              </label>
              <div className={s.stack}>
                <span className={classes.muted}>{t("crmeSlaResponseDue", [w.at(data.responseDueAt)])}</span>
                <span className={classes.muted}>{t("crmeSlaResolveDue", [w.at(data.resolveDueAt)])}</span>
                {data.firstResponseAt && <span className={classes.muted}>{t("crmeFirstResponse", [w.at(data.firstResponseAt)])}</span>}
                {data.breach !== "none" && <Badge tone="bad">{t(data.breach === "resolve" ? "crmeSlaResolve" : "crmeSlaResponse")}</Badge>}
              </div>
              {canWrite && <ConfirmButton onConfirm={async () => (await call("DELETE", `/tickets/${id}`)) && router.push(`${panel}/crm/tickets`)}>{t("bizDelete")}</ConfirmButton>}
            </div>
          </aside>
        </div>
      )}
    </HandleLoading>
  );
};

const CrmTickets = ({ id }: { id?: string }) => (id ? <TicketDetail id={id} /> : <TicketList />);

export default CrmTickets;
