"use client";

import { useState } from "react";
import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import useNotification from "@/Components/Hooks/useNotification";
import usePopup from "@/Components/Hooks/usePopup";
import PopupCard from "@/Components/UI/PopupCard";
import DateInput from "@/Components/UI/DateInput";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import Link from "@/Components/i18n/Link";
import classes from "../Accounting.module.css";
import crm from "./Crm.module.css";
import { asArray, isoDay, useBizFormat } from "../bizShared";
import {
  CrmContact,
  CrmContext,
  CrmInsurer,
  CrmTimelineItem,
  errText,
  insurerKey,
  phoneText,
  sessionTypeKey,
  sourceKey,
  useCrm,
  useCrmTeam,
  useCrmTemplates,
  useCrmText,
} from "./crmShared";
import { TagPicker } from "./CrmRulesForm";
import ContactSalesCard from "../CrmSales/ContactSalesCard";

type Ctx = React.ContextType<typeof CrmContext>;
const SMS_POPUP = "CrmContactSms";
const FU_POPUP = "CrmContactFollowUp";

const kindKey: Record<CrmTimelineItem["kind"], string> = {
  visit: "crmTlVisit",
  order: "crmTlOrder",
  note: "crmTlNote",
  call: "crmTlCall",
  followUp: "crmTlFollowUp",
  sms: "crmTlSms",
};
const visitStatusKey: Record<string, string> = {
  pending: "crmVisitPending",
  active: "crmVisitActive",
  completed: "crmVisitCompleted",
  cancelled: "crmVisitCancelled",
  noShow: "crmVisitNoShow",
  error: "crmVisitError",
};

// one approved template to this patient, now
export const SendSms = ({ contact, onDone }: { contact: CrmContact; onDone: () => unknown }) => {
  const t = useCrmText();
  const f = useBizFormat();
  const { api } = useCrm();
  const { closePopup } = usePopup();
  const pushNotification = useNotification();
  const { data: templates } = useCrmTemplates();
  const approved = asArray<{ _id: string; name: string; text: string; status: string }>(templates).filter((x) => x.status === "Approved");
  const [tpl, setTpl] = useState("");
  const [preview, setPreview] = useState<{ preview: string; parts: number } | null>(null);
  const [busy, setBusy] = useState(false);
  const choose = async (id: string) => {
    setTpl(id);
    const text = approved.find((x) => x._id === id)?.text || "";
    setPreview(null);
    if (!text) return;
    const res = await fetcher({ url: `${API}${api}/templates/preview`, method: "POST", payload: { text } }).catch(() => null);
    if (res) setPreview(res.data as { preview: string; parts: number });
  };
  const send = async () => {
    setBusy(true);
    try {
      await fetcher({ url: `${API}${api}/contacts/${contact._id}/sms`, method: "POST", payload: { template: tpl } });
      pushNotification(t("crmSmsSent"), "Success");
      closePopup(SMS_POPUP);
      onDone();
    } catch (err) {
      pushNotification(errText(err), "Error");
      setBusy(false);
    }
  };
  return (
    <PopupCard title={t("crmSendSmsTo", [contact.name || phoneText(contact.phone)])}>
      <div className={classes.popup}>
        {approved.length === 0 ? (
          <p className={classes.muted}>{t("crmNoApprovedTemplates")}</p>
        ) : (
          <label className={classes.field}>
            {t("crmTemplate")}
            <select value={tpl} onChange={(e) => choose(e.target.value)}>
              <option value="">{t("bizSelect")}</option>
              {approved.map((x) => (
                <option key={x._id} value={x._id}>
                  {x.name}
                </option>
              ))}
            </select>
          </label>
        )}
        {!!preview && (
          <div className={crm.phone}>
            <pre className={crm.bubble} dir="auto">
              {preview.preview}
            </pre>
            <span className={classes.muted}>{t("crmPartsN", [f.money(preview.parts)])}</span>
          </div>
        )}
        <p className={classes.muted}>{t("crmSmsCostHint")}</p>
        <div className={classes.actions}>
          <button type="button" className={classes.ghost} onClick={() => closePopup(SMS_POPUP)}>
            {t("bizCancel")}
          </button>
          <button type="button" className={classes.primary} disabled={busy || !tpl || contact.smsOptOut} onClick={send}>
            {t("crmSendNow")}
          </button>
        </div>
      </div>
    </PopupCard>
  );
};

// a follow-up for this patient: what, when, who
export const NewFollowUp = ({ contactId, onDone }: { contactId: string; onDone: () => unknown }) => {
  const t = useCrmText();
  const { api } = useCrm();
  const { closePopup } = usePopup();
  const pushNotification = useNotification();
  const { data: team } = useCrmTeam();
  const [text, setText] = useState("");
  const [due, setDue] = useState<Date | null>(null);
  const [assignee, setAssignee] = useState("");
  const [busy, setBusy] = useState(false);
  const save = async () => {
    setBusy(true);
    try {
      await fetcher({
        url: `${API}${api}/followups`,
        method: "POST",
        payload: { contact: contactId, text: text.trim(), dueAt: isoDay(due), ...(assignee ? { assignee } : {}) },
      });
      pushNotification(t("bizSaved"), "Success");
      closePopup(FU_POPUP);
      onDone();
    } catch (err) {
      pushNotification(errText(err), "Error");
      setBusy(false);
    }
  };
  return (
    <PopupCard title={t("crmNewFollowUp")}>
      <div className={classes.popup}>
        <div className={classes.form}>
          <label className={`${classes.field} ${classes.wide}`}>
            {t("crmFollowUpText")}
            <input value={text} onChange={(e) => setText(e.target.value)} maxLength={1000} />
          </label>
          <div className={classes.field}>
            <DateInput title={t("crmDueAt")} onChange={(d) => setDue(d)} />
          </div>
          <label className={classes.field}>
            {t("crmAssignee")}
            <select value={assignee} onChange={(e) => setAssignee(e.target.value)}>
              <option value="">{t("crmAssigneeNone")}</option>
              {asArray<{ _id: string; name: string; role: string }>(team).map((m) => (
                <option key={m._id} value={m._id}>
                  {m.name} · {t(m.role === "owner" ? "crmRoleOwner" : "crmRoleSecretary")}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className={classes.actions}>
          <button type="button" className={classes.ghost} onClick={() => closePopup(FU_POPUP)}>
            {t("bizCancel")}
          </button>
          <button type="button" className={classes.primary} disabled={busy || text.trim().length < 2 || !due} onClick={save}>
            {t("bizSave")}
          </button>
        </div>
      </div>
    </PopupCard>
  );
};

const TL_FILTERS = ["all", "visits", "messages", "notes"] as const;
const tlLabel: Record<(typeof TL_FILTERS)[number], string> = { all: "crmSegAll", visits: "crmTlVisits", messages: "crmTlMessages", notes: "crmTlNotes" };

// One patient's page (2026-10): who they are, what they did with this
// centre (visits with what they paid, orders, the SMS they got and whether
// they clicked, notes, calls, follow-ups) and the quick actions - book,
// send an SMS, add a follow-up, tag.
const CrmContactProfile = ({ id }: { id: string }) => {
  const t = useCrmText();
  const f = useBizFormat();
  const ctx = useCrm();
  const { api, canWrite, canSend, panel, node } = ctx;
  const { setPopup } = usePopup();
  const pushNotification = useNotification();
  const { data, error, mutate } = useSWR<{ contact: CrmContact; timeline: CrmTimelineItem[] }>(`${API}${api}/contacts/${id}`, (url: string) =>
    fetcher({ url }).then((res) => res.data as { contact: CrmContact; timeline: CrmTimelineItem[] }),
  );
  const c = data?.contact;
  const [edit, setEdit] = useState<Partial<CrmContact> & { birth?: string | null }>({});
  const [noteKind, setNoteKind] = useState<"note" | "call">("note");
  const [note, setNote] = useState("");
  const [tl, setTl] = useState<(typeof TL_FILTERS)[number]>("all");
  const [busy, setBusy] = useState(false);
  const call = async (fn: () => Promise<unknown>) => {
    if (busy) return;
    setBusy(true);
    try {
      await fn();
      pushNotification(t("bizSaved"), "Success");
      mutate();
    } catch (err) {
      pushNotification(errText(err), "Error");
    } finally {
      setBusy(false);
    }
  };
  const save = () =>
    call(async () => {
      const { birth, ...rest } = edit;
      await fetcher({
        url: `${API}${api}/contacts/${id}`,
        method: "PATCH",
        payload: { ...rest, ...(birth !== undefined ? { birthDate: birth } : {}) },
      });
      setEdit({});
    });
  const setOptOut = (v: boolean) => call(() => fetcher({ url: `${API}${api}/contacts/${id}`, method: "PATCH", payload: { smsOptOut: v } }));
  const addNote = () =>
    call(async () => {
      await fetcher({ url: `${API}${api}/contacts/${id}/activities`, method: "POST", payload: { kind: noteKind, text: note.trim() } });
      setNote("");
    });
  const markDone = (fid: string) => call(() => fetcher({ url: `${API}${api}/activities/${fid}`, method: "PATCH", payload: { done: true } }));
  const withCtx = (n: React.ReactNode, x: Ctx = ctx) => <CrmContext.Provider value={x}>{n}</CrmContext.Provider>;
  // where a desk booking is made in this panel
  const bookHref = node === "doctor" ? `${panel}/schedule` : node === "clinic" || node === "hospital" ? `${panel}/booking` : "";
  const dirty = Object.keys(edit).length > 0;
  const items = asArray<CrmTimelineItem>(data?.timeline).filter((i) =>
    tl === "all"
      ? true
      : tl === "visits"
        ? i.kind === "visit" || i.kind === "order"
        : tl === "messages"
          ? i.kind === "sms"
          : i.kind === "note" || i.kind === "call" || i.kind === "followUp",
  );
  return (
    <HandleLoading data={!!data} error={error}>
      {!!c && (
        <>
          <section className={classes.card}>
            <div className={classes.cardHead}>
              <div className={crm.profileHead}>
                <span className={crm.profileName}>{c.name || phoneText(c.phone)}</span>
                <bdi dir="ltr" className={classes.muted}>
                  {phoneText(c.phone)}
                </bdi>
                <span className={crm.tags}>
                  <span className={classes.badge}>{t(sourceKey[c.source] || "crmSourceManual")}</span>
                  {c.smsOptOut && <span className={`${classes.badge} ${crm.badgeMuted}`}>{t("crmOptedOutBadge")}</span>}
                  {!c.isActive && <span className={`${classes.badge} ${crm.badgeMuted}`}>{t("crmInactive")}</span>}
                </span>
              </div>
              <div className={crm.rowActions}>
                {!!bookHref && canWrite && (
                  <Link href={bookHref} className={`${classes.ghost} ${crm.anchorBtn}`}>
                    {t("crmQuickBook")}
                  </Link>
                )}
                {canSend && (
                  <button type="button" className={classes.ghost} disabled={c.smsOptOut} onClick={() => setPopup(SMS_POPUP, withCtx(<SendSms contact={c} onDone={() => mutate()} />))}>
                    {t("crmQuickSms")}
                  </button>
                )}
                {canWrite && (
                  <button type="button" className={classes.primary} onClick={() => setPopup(FU_POPUP, withCtx(<NewFollowUp contactId={c._id} onDone={() => mutate()} />))}>
                    {t("crmNewFollowUp")}
                  </button>
                )}
              </div>
            </div>
            <div className={classes.tiles}>
              <div className={classes.tile}>
                <span className={classes.tileLabel}>{t("crmVisitsOrders")}</span>
                <span className={classes.tileValue}>
                  {f.money(c.visits)} / {f.money(c.orders)}
                </span>
              </div>
              <div className={classes.tile}>
                <span className={classes.tileLabel}>{t("crmNoShows")}</span>
                <span className={classes.tileValue}>{f.money(c.noShows)}</span>
              </div>
              <div className={classes.tile}>
                <span className={classes.tileLabel}>{t("crmSpent")}</span>
                <span className={classes.tileValue}>{f.money(c.spent)}</span>
              </div>
              <div className={classes.tile}>
                <span className={classes.tileLabel}>{t("crmLastSeen")}</span>
                <span className={classes.tileValue}>{f.date(c.lastSeenAt)}</span>
              </div>
              <div className={classes.tile}>
                <span className={classes.tileLabel}>{t("crmFirstSeen")}</span>
                <span className={classes.tileValue}>{f.date(c.firstSeenAt)}</span>
              </div>
            </div>
          </section>

          <div className={crm.profileGrid}>
            <section className={classes.card}>
              <span className={classes.cardTitle}>{t("crmDetails")}</span>
              <div className={classes.form}>
                <label className={classes.field}>
                  {t("crmName")}
                  <input value={edit.name ?? c.name} onChange={(e) => setEdit((x) => ({ ...x, name: e.target.value }))} disabled={!canWrite} maxLength={200} />
                </label>
                <label className={classes.field}>
                  {t("crmGender")}
                  <select
                    value={(edit.gender as string | undefined) ?? c.gender ?? ""}
                    onChange={(e) => setEdit((x) => ({ ...x, gender: (e.target.value || null) as CrmContact["gender"] }))}
                    disabled={!canWrite}
                  >
                    <option value="">—</option>
                    <option value="female">{t("crmFemale")}</option>
                    <option value="male">{t("crmMale")}</option>
                  </select>
                </label>
                <div className={classes.field}>
                  <DateInput
                    key={c.birthDate || "none"}
                    title={t("crmBirthDate")}
                    defaultValue={c.birthDate ? new Date(c.birthDate) : undefined}
                    onChange={(d) => setEdit((x) => ({ ...x, birth: isoDay(d) }))}
                    readOnly={!canWrite}
                  />
                </div>
                <label className={classes.field}>
                  {t("crmCity")}
                  <input value={edit.city ?? c.city ?? ""} onChange={(e) => setEdit((x) => ({ ...x, city: e.target.value }))} disabled={!canWrite} maxLength={100} />
                </label>
                <label className={classes.field}>
                  {t("crmInsurer")}
                  <select
                    value={(edit.insurer as string | undefined) ?? c.insurer ?? ""}
                    onChange={(e) => setEdit((x) => ({ ...x, insurer: (e.target.value || null) as CrmInsurer }))}
                    disabled={!canWrite}
                  >
                    <option value="">—</option>
                    {(Object.keys(insurerKey) as CrmInsurer[]).map((k) => (
                      <option key={k} value={k}>
                        {t(insurerKey[k])}
                      </option>
                    ))}
                  </select>
                </label>
                <div className={`${classes.field} ${classes.wide}`}>
                  <TagPicker title={t("crmTags")} value={edit.tags ?? c.tags} onChange={(v) => setEdit((x) => ({ ...x, tags: v }))} readOnly={!canWrite} />
                </div>
                <label className={`${classes.field} ${classes.wide}`}>
                  {t("crmNote")}
                  <textarea value={edit.note ?? c.note ?? ""} onChange={(e) => setEdit((x) => ({ ...x, note: e.target.value }))} disabled={!canWrite} maxLength={1000} />
                </label>
              </div>
              {canWrite && (
                <div className={classes.actions}>
                  <label className={crm.check}>
                    <input type="checkbox" checked={c.smsOptOut} onChange={(e) => setOptOut(e.target.checked)} />
                    {t("crmOptOut")}
                  </label>
                  {dirty && (
                    <button type="button" className={classes.ghost} onClick={() => setEdit({})}>
                      {t("bizCancel")}
                    </button>
                  )}
                  <button type="button" className={classes.primary} disabled={busy || !dirty} onClick={save}>
                    {t("bizSave")}
                  </button>
                </div>
              )}
            </section>

            <section className={classes.card}>
              <div className={classes.cardHead}>
                <span className={classes.cardTitle}>{t("crmTimeline")}</span>
                <div className={crm.scrollRow}>
                  <div className={classes.segmented} role="tablist">
                    {TL_FILTERS.map((k) => (
                      <button key={k} type="button" role="tab" aria-selected={tl === k} className={tl === k ? classes.on : ""} onClick={() => setTl(k)}>
                        {t(tlLabel[k])}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              {canWrite && (
                <div className={crm.noteRow}>
                  <select value={noteKind} onChange={(e) => setNoteKind(e.target.value as "note" | "call")} aria-label={t("crmAddActivity")}>
                    <option value="note">{t("crmTlNote")}</option>
                    <option value="call">{t("crmTlCall")}</option>
                  </select>
                  <input value={note} onChange={(e) => setNote(e.target.value)} maxLength={1000} placeholder={t("crmNotePlaceholder")} aria-label={t("crmActivityText")} />
                  <button type="button" className={classes.primary} disabled={busy || note.trim().length < 2} onClick={addNote}>
                    {t("bizSave")}
                  </button>
                </div>
              )}
              {items.length === 0 ? (
                <p className={classes.empty}>{t("bizEmpty")}</p>
              ) : (
                <ol className={crm.timeline}>
                  {items.map((i, n) => (
                    <li key={`${i.kind}${i.id || n}`} className={crm.tlItem}>
                      <span className={`${classes.badge} ${crm[`tl_${i.kind}`] || ""}`}>{t(kindKey[i.kind])}</span>
                      <span className={crm.tlText}>
                        {i.kind === "visit" && (
                          <>
                            {t(visitStatusKey[i.status || ""] || "crmTlVisit")}
                            {i.sessionType && sessionTypeKey[i.sessionType] ? ` · ${t(sessionTypeKey[i.sessionType])}` : ""}
                            {i.amount ? ` · ${f.money(i.amount)} ${t("toman")}` : ""}
                          </>
                        )}
                        {i.kind === "sms" && (
                          <>
                            <span className={crm.smsLine}>{i.text}</span>
                            <span className={classes.muted}>
                              {t(i.source === "campaign" ? "crmFromCampaign" : i.source === "automation" ? "crmFromAutomation" : "crmFromSingle")}
                              {" · "}
                              {t(i.status === "sent" ? "crmMsgSent" : i.status === "failed" ? "crmMsgFailed" : "crmMsgQueued")}
                              {i.clicks ? ` · ${t("crmClickedN", [f.money(i.clicks)])}` : ""}
                            </span>
                          </>
                        )}
                        {i.kind !== "visit" && i.kind !== "sms" && (i.text || "")}
                        {i.kind === "followUp" && i.dueAt ? ` · ${t("crmDueAt")}: ${f.date(i.dueAt)}` : ""}
                        {i.kind === "followUp" && i.doneAt ? ` · ${t("crmDone")}` : ""}
                      </span>
                      <span className={crm.tlSide}>
                        <span className={classes.muted}>{f.date(i.at)}</span>
                        {i.kind === "followUp" && !i.doneAt && canWrite && i.id && (
                          <button type="button" className={crm.linkButton} onClick={() => markDone(i.id!)}>
                            {t("crmMarkDone")}
                          </button>
                        )}
                      </span>
                    </li>
                  ))}
                </ol>
              )}
            </section>
          </div>
          {/* the sales side: inquiries, plans, contracts, credit (CrmSales) */}
          <ContactSalesCard contactId={c._id} />
        </>
      )}
    </HandleLoading>
  );
};

export default CrmContactProfile;
