"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import useNotification from "@/Components/Hooks/useNotification";
import usePopup from "@/Components/Hooks/usePopup";
import PopupCard from "@/Components/UI/PopupCard";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import Link from "@/Components/i18n/Link";
import classes from "../Accounting.module.css";
import crm from "./Crm.module.css";
import { asArray, useBizFormat } from "../bizShared";
import { CrmContact, CrmContext, CrmFollowUp, errText, phoneText, useCrm, useCrmTeam, useCrmText } from "./crmShared";
import { NewFollowUp } from "./CrmContactProfile";

const PICK = "CrmPickContact";
const FU_POPUP = "CrmContactFollowUp";
const STATUSES = ["open", "done", "all"] as const;
const DUES = ["", "overdue", "today", "week"] as const;
const statusLabel: Record<(typeof STATUSES)[number], string> = { open: "crmFuOpen", done: "crmDone", all: "crmSegAll" };
const dueLabel: Record<(typeof DUES)[number], string> = { "": "crmFuDueAny", overdue: "crmFuOverdue", today: "crmFuToday", week: "crmFuWeek" };

// a follow-up starts from a patient: find them first
const PickContact = ({ onPick }: { onPick: (c: CrmContact) => unknown }) => {
  const t = useCrmText();
  const { api } = useCrm();
  const { closePopup } = usePopup();
  const [q, setQ] = useState("");
  const [rows, setRows] = useState<CrmContact[]>([]);
  useEffect(() => {
    const h = setTimeout(() => {
      fetcher({ url: `${API}${api}/contacts?limit=8&q=${encodeURIComponent(q.trim())}` })
        .then((res) => setRows(asArray<CrmContact>(res.data?.items)))
        .catch(() => setRows([]));
    }, 300);
    return () => clearTimeout(h);
  }, [api, q]);
  return (
    <PopupCard title={t("crmPickContact")}>
      <div className={classes.popup}>
        <label className={classes.field}>
          {t("crmSearch")}
          <input value={q} onChange={(e) => setQ(e.target.value)} autoFocus />
        </label>
        <ul className={crm.miniList}>
          {rows.map((c) => (
            <li key={c._id}>
              <button
                type="button"
                className={crm.miniMain}
                onClick={() => {
                  closePopup(PICK);
                  onPick(c);
                }}
              >
                <span className={crm.fuText}>{c.name || "—"}</span>
                <bdi dir="ltr" className={classes.muted}>
                  {phoneText(c.phone)}
                </bdi>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </PopupCard>
  );
};

// Follow-ups (2026-10): the centre's patient tasks ("call for the check-up
// result"), each with a due date and the owner or a secretary it is given
// to, who is reminded in-app when it falls due. Overdue first.
const CrmFollowUps = () => {
  const t = useCrmText();
  const f = useBizFormat();
  const ctx = useCrm();
  const { api, canWrite, panel } = ctx;
  const { setPopup } = usePopup();
  const pushNotification = useNotification();
  const { data: team } = useCrmTeam();
  const [status, setStatus] = useState<(typeof STATUSES)[number]>("open");
  const [due, setDue] = useState<(typeof DUES)[number]>("");
  const [assignee, setAssignee] = useState("");
  const [busy, setBusy] = useState("");
  const p = new URLSearchParams({ status });
  if (due) p.set("due", due);
  if (assignee) p.set("assignee", assignee);
  const { data, error, mutate } = useSWR<CrmFollowUp[]>(`${API}${api}/followups?${p}`, (url: string) =>
    fetcher({ url }).then((res) => asArray<CrmFollowUp>(res.data)),
  );
  const patch = async (id: string, payload: Record<string, unknown>) => {
    if (busy) return;
    setBusy(id);
    try {
      await fetcher({ url: `${API}${api}/activities/${id}`, method: "PATCH", payload });
      pushNotification(t("bizSaved"), "Success");
      mutate();
    } catch (err) {
      pushNotification(errText(err), "Error");
    } finally {
      setBusy("");
    }
  };
  const withCtx = (n: React.ReactNode) => <CrmContext.Provider value={ctx}>{n}</CrmContext.Provider>;
  const add = () =>
    setPopup(PICK, withCtx(<PickContact onPick={(c) => setPopup(FU_POPUP, withCtx(<NewFollowUp contactId={c._id} onDone={() => mutate()} />))} />));
  const members = asArray<{ _id: string; name: string }>(team);
  const nameOf = (id?: string) => members.find((m) => m._id === id)?.name || "";
  const now = Date.now();
  const rows = asArray<CrmFollowUp>(data);
  return (
    <section className={classes.card}>
      <div className={classes.cardHead}>
        <div className={classes.filters}>
          <div className={classes.segmented} role="tablist">
            {STATUSES.map((s) => (
              <button key={s} type="button" role="tab" aria-selected={status === s} className={status === s ? classes.on : ""} onClick={() => setStatus(s)}>
                {t(statusLabel[s])}
              </button>
            ))}
          </div>
          <select value={due} onChange={(e) => setDue(e.target.value as (typeof DUES)[number])} aria-label={t("crmDueAt")}>
            {DUES.map((d) => (
              <option key={d || "any"} value={d}>
                {t(dueLabel[d])}
              </option>
            ))}
          </select>
          <select value={assignee} onChange={(e) => setAssignee(e.target.value)} aria-label={t("crmAssignee")}>
            <option value="">{t("crmFuAllPeople")}</option>
            <option value="me">{t("crmFuMine")}</option>
            {members.map((m) => (
              <option key={m._id} value={m._id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>
        {canWrite && (
          <button type="button" className={classes.primary} onClick={add}>
            {t("crmNewFollowUp")}
          </button>
        )}
      </div>
      <HandleLoading data={!!data} error={error}>
        {!!data &&
          (rows.length === 0 ? (
            <p className={classes.empty}>{t("crmNoFollowUps")}</p>
          ) : (
            <ul className={crm.followUps}>
              {rows.map((r) => {
                const overdue = !r.doneAt && new Date(r.dueAt).getTime() < now;
                return (
                  <li key={r._id} className={`${crm.followUp} ${overdue ? crm.overdue : ""}`}>
                    <div className={crm.fuMain}>
                      <span className={`${crm.fuText} ${r.doneAt ? crm.fuDone : ""}`}>{r.text}</span>
                      <span className={classes.muted}>
                        {r.contact ? (
                          <Link href={`${panel}/crm/contacts/${r.contact._id}`} className={crm.linkButton}>
                            {r.contact.name || phoneText(r.contact.phone)}
                          </Link>
                        ) : (
                          "—"
                        )}
                        {r.assignee ? ` · ${nameOf(r.assignee)}` : ""}
                      </span>
                    </div>
                    <span className={`${classes.badge} ${overdue ? crm.badgeWarn : r.doneAt ? crm.badgeOk : ""}`}>
                      {r.doneAt ? `${t("crmDone")} · ${f.date(r.doneAt)}` : f.date(r.dueAt)}
                    </span>
                    {canWrite && (
                      <span className={crm.rowActions}>
                        {!r.doneAt && (
                          <select
                            value={r.assignee || ""}
                            onChange={(e) => patch(r._id, { assignee: e.target.value || null })}
                            aria-label={t("crmAssignee")}
                            className={crm.inlineSelect}
                          >
                            <option value="">{t("crmAssigneeNone")}</option>
                            {members.map((m) => (
                              <option key={m._id} value={m._id}>
                                {m.name}
                              </option>
                            ))}
                          </select>
                        )}
                        <button type="button" className={classes.ghost} disabled={busy === r._id} onClick={() => patch(r._id, { done: !r.doneAt })}>
                          {t(r.doneAt ? "crmReopen" : "crmMarkDone")}
                        </button>
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          ))}
      </HandleLoading>
    </section>
  );
};

export default CrmFollowUps;
