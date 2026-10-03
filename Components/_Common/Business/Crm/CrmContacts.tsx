"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import useNotification from "@/Components/Hooks/useNotification";
import usePopup from "@/Components/Hooks/usePopup";
import PopupCard from "@/Components/UI/PopupCard";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import DateInput from "@/Components/UI/DateInput";
import classes from "../Accounting.module.css";
import crm from "./Crm.module.css";
import { asArray, isoDay, useBizFormat } from "../bizShared";
import {
  CrmContact,
  CrmContext,
  CrmTimelineItem,
  phoneText,
  sourceKey,
  useCrm,
  useCrmTags,
  useCrmText,
} from "./crmShared";

type Ctx = React.ContextType<typeof CrmContext>;
const POPUP = "CrmContact";
const NEW_POPUP = "CrmNewContact";

// tags typed as "diabetes, check-up" (comma or Persian comma)
const splitTags = (s: string) =>
  Array.from(new Set(s.split(/[,،]/).map((x) => x.trim()).filter(Boolean))).slice(0, 20);

const NewContact = ({ onDone }: { onDone: () => unknown }) => {
  const t = useCrmText();
  const { api } = useCrm();
  const { closePopup } = usePopup();
  const pushNotification = useNotification();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [tags, setTags] = useState("");
  const [busy, setBusy] = useState(false);
  const save = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await fetcher({ url: `${API}${api}/contacts`, method: "POST", payload: { name: name.trim(), phone, tags: splitTags(tags) } });
      pushNotification(t("bizSaved"), "Success");
      closePopup(NEW_POPUP);
      onDone();
    } catch (err) {
      pushNotification((err as Error)?.message || String(err), "Error");
      setBusy(false);
    }
  };
  return (
    <PopupCard title={t("crmAddContact")}>
      <div className={classes.popup}>
        <p className={classes.muted}>{t("crmAddContactHint")}</p>
        <div className={classes.form}>
          <label className={classes.field}>
            {t("crmName")}
            <input value={name} onChange={(e) => setName(e.target.value)} maxLength={200} />
          </label>
          <label className={classes.field}>
            {t("crmPhone")}
            <input value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={20} dir="ltr" inputMode="tel" placeholder="09…" />
          </label>
          <label className={`${classes.field} ${classes.wide}`}>
            {t("crmTags")}
            <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder={t("crmTagsHint")} />
          </label>
        </div>
        <div className={classes.actions}>
          <button type="button" className={classes.ghost} onClick={() => closePopup(NEW_POPUP)}>
            {t("bizCancel")}
          </button>
          <button type="button" className={classes.primary} disabled={busy || phone.trim().length < 10} onClick={save}>
            {t("bizSave")}
          </button>
        </div>
      </div>
    </PopupCard>
  );
};

const kindKey = {
  visit: "crmTlVisit",
  order: "crmTlOrder",
  note: "crmTlNote",
  call: "crmTlCall",
  followUp: "crmTlFollowUp",
} as const;

// One contact: details the owner keeps (tags, note, opt-out), the history
// with this owner, and a new note, call or follow-up.
const ContactDetail = ({ id, onChanged }: { id: string; onChanged: () => unknown }) => {
  const t = useCrmText();
  const f = useBizFormat();
  const { api, canWrite } = useCrm();
  const pushNotification = useNotification();
  const { data, error, mutate } = useSWR<{ contact: CrmContact; timeline: CrmTimelineItem[] }>(
    `${API}${api}/contacts/${id}`,
    (url: string) => fetcher({ url }).then((res) => res.data as { contact: CrmContact; timeline: CrmTimelineItem[] }),
  );
  const c = data?.contact;
  const [name, setName] = useState<string | null>(null);
  const [tags, setTags] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [kind, setKind] = useState<"note" | "call" | "followUp">("note");
  const [text, setText] = useState("");
  const [due, setDue] = useState<Date | null>(null);
  const [busy, setBusy] = useState(false);
  const call = async (fn: () => Promise<unknown>) => {
    if (busy) return;
    setBusy(true);
    try {
      await fn();
      pushNotification(t("bizSaved"), "Success");
      mutate();
      onChanged();
    } catch (err) {
      pushNotification((err as Error)?.message || String(err), "Error");
    } finally {
      setBusy(false);
    }
  };
  const saveDetails = () =>
    call(() =>
      fetcher({
        url: `${API}${api}/contacts/${id}`,
        method: "PATCH",
        payload: {
          ...(name !== null ? { name: name.trim() } : {}),
          ...(tags !== null ? { tags: splitTags(tags) } : {}),
          ...(note !== null ? { note: note.trim() } : {}),
        },
      }),
    );
  const setOptOut = (v: boolean) =>
    call(() => fetcher({ url: `${API}${api}/contacts/${id}`, method: "PATCH", payload: { smsOptOut: v } }));
  const addActivity = () =>
    call(async () => {
      await fetcher({
        url: `${API}${api}/contacts/${id}/activities`,
        method: "POST",
        payload: { kind, text: text.trim(), ...(kind === "followUp" && due ? { dueAt: isoDay(due) } : {}) },
      });
      setText("");
    });
  const dirty = name !== null || tags !== null || note !== null;
  return (
    <PopupCard size="wide" title={c?.name || (c ? phoneText(c.phone) : t("crmTabContacts"))}>
      <div className={classes.popup}>
        <HandleLoading data={!!data} error={error}>
          {!!c && (
            <>
              <div className={classes.tiles}>
                <div className={classes.tile}>
                  <span className={classes.tileLabel}>{t("crmPhone")}</span>
                  <span className={classes.tileValue} dir="ltr">
                    {phoneText(c.phone)}
                  </span>
                </div>
                <div className={classes.tile}>
                  <span className={classes.tileLabel}>{t("crmVisitsOrders")}</span>
                  <span className={classes.tileValue}>
                    {f.money(c.visits)} / {f.money(c.orders)}
                  </span>
                </div>
                <div className={classes.tile}>
                  <span className={classes.tileLabel}>{t("crmSpent")}</span>
                  <span className={classes.tileValue}>
                    {f.money(c.spent)}
                    <span className={classes.tileUnit}>{t("toman")}</span>
                  </span>
                </div>
                <div className={classes.tile}>
                  <span className={classes.tileLabel}>{t("crmLastSeen")}</span>
                  <span className={classes.tileValue}>{f.date(c.lastSeenAt)}</span>
                </div>
              </div>
              <section className={crm.subCard}>
                <div className={classes.form}>
                  <label className={classes.field}>
                    {t("crmName")}
                    <input value={name ?? c.name} onChange={(e) => setName(e.target.value)} disabled={!canWrite} maxLength={200} />
                  </label>
                  <label className={classes.field}>
                    {t("crmTags")}
                    <input
                      value={tags ?? c.tags.join("، ")}
                      onChange={(e) => setTags(e.target.value)}
                      disabled={!canWrite}
                      placeholder={t("crmTagsHint")}
                    />
                  </label>
                  <label className={`${classes.field} ${classes.wide}`}>
                    {t("crmNote")}
                    <textarea value={note ?? c.note ?? ""} onChange={(e) => setNote(e.target.value)} disabled={!canWrite} maxLength={1000} />
                  </label>
                </div>
                {canWrite && (
                  <div className={classes.actions}>
                    <label className={crm.check}>
                      <input type="checkbox" checked={c.smsOptOut} onChange={(e) => setOptOut(e.target.checked)} />
                      {t("crmOptOut")}
                    </label>
                    <button type="button" className={classes.primary} disabled={busy || !dirty} onClick={saveDetails}>
                      {t("bizSave")}
                    </button>
                  </div>
                )}
              </section>
              {canWrite && (
                <section className={crm.subCard}>
                  <div className={classes.cardHead}>
                    <span className={classes.cardTitle}>{t("crmAddActivity")}</span>
                    <div className={classes.segmented} role="tablist">
                      {(["note", "call", "followUp"] as const).map((k) => (
                        <button key={k} type="button" className={kind === k ? classes.on : ""} onClick={() => setKind(k)}>
                          {t(kindKey[k])}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className={classes.form}>
                    <label className={`${classes.field} ${classes.wide}`}>
                      {t(kind === "followUp" ? "crmFollowUpText" : "crmActivityText")}
                      <input value={text} onChange={(e) => setText(e.target.value)} maxLength={1000} />
                    </label>
                    {kind === "followUp" && (
                      <div className={classes.field}>
                        <DateInput title={t("crmDueAt")} onChange={(d) => setDue(d)} />
                      </div>
                    )}
                    <div className={classes.actions}>
                      <button
                        type="button"
                        className={classes.primary}
                        disabled={busy || text.trim().length < 2 || (kind === "followUp" && !due)}
                        onClick={addActivity}
                      >
                        {t("bizSave")}
                      </button>
                    </div>
                  </div>
                </section>
              )}
              <section className={crm.subCard}>
                <span className={classes.cardTitle}>{t("crmTimeline")}</span>
                {asArray<CrmTimelineItem>(data?.timeline).length === 0 ? (
                  <p className={classes.empty}>{t("bizEmpty")}</p>
                ) : (
                  <ol className={crm.timeline}>
                    {asArray<CrmTimelineItem>(data?.timeline).map((i, n) => (
                      <li key={`${i.kind}${i.id || n}`} className={crm.tlItem}>
                        <span className={`${classes.badge} ${crm[`tl_${i.kind}`] || ""}`}>{t(kindKey[i.kind])}</span>
                        <span className={crm.tlText}>
                          {i.text || ""}
                          {i.kind === "followUp" && i.dueAt ? ` · ${t("crmDueAt")}: ${f.date(i.dueAt)}` : ""}
                          {i.kind === "followUp" && i.doneAt ? ` · ${t("crmDone")}` : ""}
                        </span>
                        <span className={classes.muted}>{f.date(i.at)}</span>
                      </li>
                    ))}
                  </ol>
                )}
              </section>
            </>
          )}
        </HandleLoading>
      </div>
    </PopupCard>
  );
};

const LIMIT = 30;
const SEGMENTS = ["", "recent", "lapsed", "loyal", "optedOut"] as const;
const segmentKey = {
  "": "crmSegAll",
  recent: "crmSegRecent",
  lapsed: "crmSegLapsed",
  loyal: "crmSegLoyal",
  optedOut: "crmSegOptedOut",
} as const;

const CrmContacts = ({ refreshKey, onChanged }: { refreshKey: number; onChanged: () => unknown }) => {
  const t = useCrmText();
  const f = useBizFormat();
  const ctx = useCrm();
  const { setPopup } = usePopup();
  const { data: tags } = useCrmTags();
  const [q, setQ] = useState("");
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState("");
  const [segment, setSegment] = useState<(typeof SEGMENTS)[number]>("");
  const [page, setPage] = useState(1);
  const params = new URLSearchParams({ page: String(page), limit: String(LIMIT) });
  if (query) params.set("q", query);
  if (tag) params.set("tag", tag);
  if (segment) params.set("segment", segment);
  const { data, error, mutate, isValidating } = useSWR<{ items: CrmContact[]; total: number }>(
    `${API}${ctx.api}/contacts?${params}`,
    (url: string) => fetcher({ url }).then((res) => ({ items: asArray<CrmContact>(res.data?.items), total: Number(res.data?.total) || 0 })),
    { keepPreviousData: true },
  );
  useEffect(() => {
    mutate();
  }, [refreshKey, mutate]);
  useEffect(() => {
    const h = setTimeout(() => {
      setQuery(q.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(h);
  }, [q]);
  const pages = Math.max(1, Math.ceil((data?.total || 0) / LIMIT));
  const changed = () => {
    mutate();
    onChanged();
  };
  const withCtx = (node: React.ReactNode, c: Ctx = ctx) => <CrmContext.Provider value={c}>{node}</CrmContext.Provider>;
  const open = (c: CrmContact) => setPopup(POPUP, withCtx(<ContactDetail id={c._id} onChanged={changed} />));
  return (
    <section className={classes.card}>
      <div className={classes.cardHead}>
        <div className={classes.filters}>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("crmSearch")} aria-label={t("crmSearch")} />
          <select value={tag} onChange={(e) => { setTag(e.target.value); setPage(1); }} aria-label={t("crmTags")}>
            <option value="">{t("crmAllTags")}</option>
            {asArray<string>(tags).map((x) => (
              <option key={x} value={x}>
                {x}
              </option>
            ))}
          </select>
        </div>
        {ctx.canWrite && (
          <button type="button" className={classes.primary} onClick={() => setPopup(NEW_POPUP, withCtx(<NewContact onDone={changed} />))}>
            {t("crmAddContact")}
          </button>
        )}
      </div>
      <div className={crm.scrollRow}>
        <div className={classes.segmented} role="tablist">
          {SEGMENTS.map((s) => (
            <button key={s || "all"} type="button" className={segment === s ? classes.on : ""} onClick={() => { setSegment(s); setPage(1); }}>
              {t(segmentKey[s])}
            </button>
          ))}
        </div>
      </div>
      <HandleLoading data={!!data} error={error}>
        {!!data &&
          (data.items.length === 0 ? (
            <p className={classes.empty}>{t("crmNoContacts")}</p>
          ) : (
            <div className={classes.tableWrap} style={{ opacity: isValidating ? 0.6 : 1 }}>
              <table className={classes.table}>
                <thead>
                  <tr>
                    <th>{t("crmName")}</th>
                    <th>{t("crmPhone")}</th>
                    <th>{t("crmSource")}</th>
                    <th className={classes.num}>{t("crmVisitsOrders")}</th>
                    <th className={classes.num}>{t("crmSpent")}</th>
                    <th>{t("crmLastSeen")}</th>
                    <th>{t("crmTags")}</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((c) => (
                    <tr key={c._id} className={classes.rowLink} tabIndex={0} onClick={() => open(c)} onKeyDown={(e) => e.key === "Enter" && open(c)}>
                      <td className={classes.wrap}>
                        {c.name || "—"} {c.smsOptOut && <span className={`${classes.badge} ${crm.badgeMuted}`}>{t("crmOptedOutBadge")}</span>}
                      </td>
                      <td dir="ltr" className={crm.start}>
                        {phoneText(c.phone)}
                      </td>
                      <td>
                        <span className={classes.badge}>{t(sourceKey[c.source] || "crmSourceManual")}</span>
                      </td>
                      <td className={classes.num}>
                        {f.money(c.visits)} / {f.money(c.orders)}
                      </td>
                      <td className={classes.num}>{f.money(c.spent)}</td>
                      <td>{f.date(c.lastSeenAt)}</td>
                      <td className={classes.wrap}>
                        <span className={crm.tags}>
                          {asArray<string>(c.tags).map((x) => (
                            <span key={x} className={crm.tag}>
                              {x}
                            </span>
                          ))}
                        </span>
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
          <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            {t("bizPrev")}
          </button>
          <span>{t("bizPage", [f.money(page), f.money(pages)])}</span>
          <button type="button" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>
            {t("bizNext")}
          </button>
        </div>
      )}
    </section>
  );
};

export default CrmContacts;
