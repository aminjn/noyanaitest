"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import useNotification from "@/Components/Hooks/useNotification";
import usePopup from "@/Components/Hooks/usePopup";
import PopupCard from "@/Components/UI/PopupCard";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import { useRouter } from "@/Components/i18n/navigation";
import classes from "../Accounting.module.css";
import crm from "./Crm.module.css";
import { asArray, useBizFormat } from "../bizShared";
import {
  CrmContact,
  CrmContext,
  CrmInsurer,
  CrmRules,
  CrmSegment,
  emptyRules,
  errText,
  hasRules,
  insurerKey,
  phoneText,
  presetKey,
  useCrm,
  useCrmText,
} from "./crmShared";
import CrmRulesForm, { TagPicker } from "./CrmRulesForm";
import CrmImport from "./CrmImport";

type Ctx = React.ContextType<typeof CrmContext>;
const NEW_POPUP = "CrmNewContact";
const TAG_POPUP = "CrmBulkTag";
const SEG_POPUP = "CrmSaveSegment";

// a hand-added patient: only someone who agreed to hear from this centre
const NewContact = ({ onDone }: { onDone: (id?: string) => unknown }) => {
  const t = useCrmText();
  const { api } = useCrm();
  const { closePopup } = usePopup();
  const pushNotification = useNotification();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("");
  const [insurer, setInsurer] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const save = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const res = await fetcher({
        url: `${API}${api}/contacts`,
        method: "POST",
        payload: { name: name.trim(), phone, tags, ...(gender ? { gender } : {}), ...(insurer ? { insurer } : {}) },
      });
      pushNotification(t("bizSaved"), "Success");
      closePopup(NEW_POPUP);
      onDone((res.data as { _id?: string })?._id);
    } catch (err) {
      pushNotification(errText(err), "Error");
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
          <label className={classes.field}>
            {t("crmGender")}
            <select value={gender} onChange={(e) => setGender(e.target.value)}>
              <option value="">{t("crmAny")}</option>
              <option value="female">{t("crmFemale")}</option>
              <option value="male">{t("crmMale")}</option>
            </select>
          </label>
          <label className={classes.field}>
            {t("crmInsurer")}
            <select value={insurer} onChange={(e) => setInsurer(e.target.value)}>
              <option value="">—</option>
              {(Object.keys(insurerKey) as CrmInsurer[]).map((k) => (
                <option key={k} value={k}>
                  {t(insurerKey[k])}
                </option>
              ))}
            </select>
          </label>
          <div className={`${classes.field} ${classes.wide}`}>
            <TagPicker title={t("crmTags")} value={tags} onChange={setTags} />
          </div>
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

// add or remove tags on the selected contacts
const BulkTag = ({ ids, onDone }: { ids: string[]; onDone: () => unknown }) => {
  const t = useCrmText();
  const f = useBizFormat();
  const { api } = useCrm();
  const { closePopup } = usePopup();
  const pushNotification = useNotification();
  const [add, setAdd] = useState<string[]>([]);
  const [remove, setRemove] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const save = async () => {
    setBusy(true);
    try {
      await fetcher({ url: `${API}${api}/contacts/bulk-tag`, method: "POST", payload: { ids, add, remove } });
      pushNotification(t("bizSaved"), "Success");
      closePopup(TAG_POPUP);
      onDone();
    } catch (err) {
      pushNotification(errText(err), "Error");
      setBusy(false);
    }
  };
  return (
    <PopupCard title={t("crmBulkTagTitle", [f.money(ids.length)])}>
      <div className={classes.popup}>
        <TagPicker title={t("crmBulkTagAdd")} value={add} onChange={setAdd} />
        <TagPicker title={t("crmBulkTagRemove")} value={remove} onChange={setRemove} />
        <div className={classes.actions}>
          <button type="button" className={classes.ghost} onClick={() => closePopup(TAG_POPUP)}>
            {t("bizCancel")}
          </button>
          <button type="button" className={classes.primary} disabled={busy || (!add.length && !remove.length)} onClick={save}>
            {t("bizSave")}
          </button>
        </div>
      </div>
    </PopupCard>
  );
};

// the current filter as a saved, dynamic segment
const SaveSegment = ({ rules, onDone }: { rules: CrmRules; onDone: () => unknown }) => {
  const t = useCrmText();
  const { api } = useCrm();
  const { closePopup } = usePopup();
  const pushNotification = useNotification();
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const save = async () => {
    setBusy(true);
    try {
      await fetcher({ url: `${API}${api}/segments`, method: "POST", payload: { name: name.trim(), rules } });
      pushNotification(t("bizSaved"), "Success");
      closePopup(SEG_POPUP);
      onDone();
    } catch (err) {
      pushNotification(errText(err), "Error");
      setBusy(false);
    }
  };
  return (
    <PopupCard title={t("crmSaveAsSegment")}>
      <div className={classes.popup}>
        <label className={classes.field}>
          {t("crmSegmentName")}
          <input value={name} onChange={(e) => setName(e.target.value)} maxLength={80} placeholder={t("crmSegmentNameHint")} />
        </label>
        <div className={classes.actions}>
          <button type="button" className={classes.ghost} onClick={() => closePopup(SEG_POPUP)}>
            {t("bizCancel")}
          </button>
          <button type="button" className={classes.primary} disabled={busy || name.trim().length < 2} onClick={save}>
            {t("bizSave")}
          </button>
        </div>
      </div>
    </PopupCard>
  );
};

const LIMIT = 30;
const SORTS = ["recent", "visits", "spent", "name", "new"] as const;
const sortKey: Record<(typeof SORTS)[number], string> = {
  recent: "crmSortRecent",
  visits: "crmSortVisits",
  spent: "crmSortSpent",
  name: "crmSortName",
  new: "crmSortNew",
};

const CrmContacts = () => {
  const t = useCrmText();
  const f = useBizFormat();
  const ctx = useCrm();
  const router = useRouter();
  const search = useSearchParams();
  const { setPopup } = usePopup();
  const pushNotification = useNotification();
  const [q, setQ] = useState("");
  const [query, setQuery] = useState("");
  const [segment, setSegment] = useState(search?.get("segment") || "");
  const [sort, setSort] = useState<(typeof SORTS)[number]>("recent");
  const [optedOut, setOptedOut] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [rules, setRules] = useState<CrmRules>(emptyRules());
  const [applied, setApplied] = useState<CrmRules>(emptyRules());
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<string[]>([]);
  const { data: segs, mutate: mutateSegs } = useSWR<{ presets: CrmSegment[]; saved: CrmSegment[] }>(`${API}${ctx.api}/segments`, (url: string) =>
    fetcher({ url }).then((res) => res.data as { presets: CrmSegment[]; saved: CrmSegment[] }),
  );
  const params = useMemo(() => {
    const p = new URLSearchParams({ page: String(page), limit: String(LIMIT), sort });
    if (query) p.set("q", query);
    if (segment) p.set("segment", segment);
    if (optedOut) p.set("optedOut", "1");
    if (hasRules(applied)) p.set("rules", JSON.stringify(applied));
    return p;
  }, [page, sort, query, segment, optedOut, applied]);
  const { data, error, mutate, isValidating } = useSWR<{ items: CrmContact[]; total: number }>(
    `${API}${ctx.api}/contacts?${params}`,
    (url: string) => fetcher({ url }).then((res) => ({ items: asArray<CrmContact>(res.data?.items), total: Number(res.data?.total) || 0 })),
    { keepPreviousData: true },
  );
  useEffect(() => {
    const h = setTimeout(() => {
      setQuery(q.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(h);
  }, [q]);
  useEffect(() => setSelected([]), [params]);
  const pages = Math.max(1, Math.ceil((data?.total || 0) / LIMIT));
  const withCtx = (node: React.ReactNode, c: Ctx = ctx) => <CrmContext.Provider value={c}>{node}</CrmContext.Provider>;
  const open = (c: CrmContact) => router.push(`${ctx.panel}/crm/contacts/${c._id}`);
  const rows = data?.items || [];
  const allOn = rows.length > 0 && rows.every((r) => selected.includes(r._id));
  const toggle = (id: string) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const exportCsv = async () => {
    try {
      const p = new URLSearchParams(params);
      p.delete("page");
      p.delete("limit");
      const res = await fetch(`${API}${ctx.api}/contacts/export?${p}`, { credentials: "include" });
      if (!res.ok) throw new Error(t("crmExportFailed"));
      const url = URL.createObjectURL(await res.blob());
      const a = document.createElement("a");
      a.href = url;
      a.download = "contacts.csv";
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
    } catch (err) {
      pushNotification(errText(err), "Error");
    }
  };
  return (
    <section className={classes.card}>
      <div className={classes.cardHead}>
        <div className={classes.filters}>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("crmSearch")} aria-label={t("crmSearch")} />
          <select
            value={segment}
            onChange={(e) => {
              setSegment(e.target.value);
              setPage(1);
            }}
            aria-label={t("crmNavSegments")}
          >
            <option value="">{t("crmSegAll")}</option>
            {asArray<CrmSegment>(segs?.presets).map((s) => (
              <option key={s._id} value={s._id}>
                {t(presetKey[s.preset || ""] || s.preset || "")} ({f.money(s.count)})
              </option>
            ))}
            {asArray<CrmSegment>(segs?.saved).map((s) => (
              <option key={s._id} value={s._id}>
                {s.name} ({f.money(s.count)})
              </option>
            ))}
          </select>
          <select value={sort} onChange={(e) => setSort(e.target.value as (typeof SORTS)[number])} aria-label={t("crmSort")}>
            {SORTS.map((s) => (
              <option key={s} value={s}>
                {t(sortKey[s])}
              </option>
            ))}
          </select>
          <button type="button" className={`${classes.ghost} ${showFilters || hasRules(applied) ? crm.ghostOn : ""}`} onClick={() => setShowFilters((v) => !v)}>
            {t("crmFilters")}
          </button>
          <label className={crm.check}>
            <input type="checkbox" checked={optedOut} onChange={(e) => setOptedOut(e.target.checked)} />
            {t("crmSegOptedOut")}
          </label>
        </div>
        <div className={crm.rowActions}>
          <button type="button" className={classes.ghost} onClick={exportCsv}>
            {t("crmExport")}
          </button>
          {ctx.canWrite && (
            <button type="button" className={classes.ghost} onClick={() => setPopup("CrmImport", withCtx(<CrmImport onDone={() => mutate()} />))}>
              {t("crmImport")}
            </button>
          )}
          {ctx.canWrite && (
            <button
              type="button"
              className={classes.primary}
              onClick={() => setPopup(NEW_POPUP, withCtx(<NewContact onDone={(id) => (id ? router.push(`${ctx.panel}/crm/contacts/${id}`) : mutate())} />))}
            >
              {t("crmAddContact")}
            </button>
          )}
        </div>
      </div>
      {showFilters && (
        <div className={crm.subCard}>
          <CrmRulesForm rules={rules} onChange={setRules} />
          <div className={classes.actions}>
            <button
              type="button"
              className={classes.ghost}
              onClick={() => {
                setRules(emptyRules());
                setApplied(emptyRules());
              }}
            >
              {t("crmClearFilters")}
            </button>
            {ctx.canWrite && hasRules(rules) && (
              <button type="button" className={classes.ghost} onClick={() => setPopup(SEG_POPUP, withCtx(<SaveSegment rules={rules} onDone={() => mutateSegs()} />))}>
                {t("crmSaveAsSegment")}
              </button>
            )}
            <button
              type="button"
              className={classes.primary}
              onClick={() => {
                setApplied(rules);
                setPage(1);
              }}
            >
              {t("crmApplyFilters")}
            </button>
          </div>
        </div>
      )}
      {selected.length > 0 && ctx.canWrite && (
        <div className={crm.bulkBar}>
          <span>{t("crmSelected", [f.money(selected.length)])}</span>
          <button type="button" className={classes.ghost} onClick={() => setPopup(TAG_POPUP, withCtx(<BulkTag ids={selected} onDone={() => mutate()} />))}>
            {t("crmBulkTag")}
          </button>
          <button type="button" className={classes.ghost} onClick={() => router.push(`${ctx.panel}/crm/campaigns?contacts=${selected.join(",")}`)}>
            {t("crmBulkCampaign")}
          </button>
          <button type="button" className={crm.linkButton} onClick={() => setSelected([])}>
            {t("bizCancel")}
          </button>
        </div>
      )}
      <HandleLoading data={!!data} error={error}>
        {!!data &&
          (rows.length === 0 ? (
            <p className={classes.empty}>{t("crmNoContacts")}</p>
          ) : (
            <>
              <p className={classes.muted}>{t("crmContactsCount", [f.money(data.total)])}</p>
              <div className={classes.tableWrap} style={{ opacity: isValidating ? 0.6 : 1 }}>
                <table className={classes.table}>
                  <thead>
                    <tr>
                      {ctx.canWrite && (
                        <th className={crm.selCol}>
                          <input
                            type="checkbox"
                            aria-label={t("crmSelectAll")}
                            checked={allOn}
                            onChange={() => setSelected(allOn ? [] : rows.map((r) => r._id))}
                          />
                        </th>
                      )}
                      <th>{t("crmName")}</th>
                      <th>{t("crmPhone")}</th>
                      <th>{t("crmLastSeen")}</th>
                      <th className={classes.num}>{t("crmVisitsOrders")}</th>
                      <th className={classes.num}>{t("crmNoShows")}</th>
                      <th className={classes.num}>{t("crmSpent")}</th>
                      <th>{t("crmTags")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((c) => (
                      <tr key={c._id} className={classes.rowLink} tabIndex={0} onClick={() => open(c)} onKeyDown={(e) => e.key === "Enter" && open(c)}>
                        {ctx.canWrite && (
                          <td className={crm.selCol} onClick={(e) => e.stopPropagation()}>
                            <input type="checkbox" aria-label={c.name || c.phone} checked={selected.includes(c._id)} onChange={() => toggle(c._id)} />
                          </td>
                        )}
                        <td className={classes.wrap}>
                          {c.name || "—"} {c.smsOptOut && <span className={`${classes.badge} ${crm.badgeMuted}`}>{t("crmOptedOutBadge")}</span>}
                          {!!c.insurer && c.insurer !== "none" && <span className={crm.subText}>{t(insurerKey[c.insurer])}</span>}
                        </td>
                        <td dir="ltr" className={crm.start}>
                          {phoneText(c.phone)}
                        </td>
                        <td>{f.date(c.lastSeenAt)}</td>
                        <td className={classes.num}>
                          {f.money(c.visits)} / {f.money(c.orders)}
                        </td>
                        <td className={classes.num}>{c.noShows ? f.money(c.noShows) : "—"}</td>
                        <td className={classes.num}>{f.money(c.spent)}</td>
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
            </>
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
