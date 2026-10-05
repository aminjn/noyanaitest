"use client";

import { useState } from "react";
import usePopup from "@/Components/Hooks/usePopup";
import PopupCard from "@/Components/UI/PopupCard";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import DateInput from "@/Components/UI/DateInput";
import StarIcon from "@/Components/Icons/StarIcon";
import classes from "../../Accounting.module.css";
import crm from "../Crm.module.css";
import s from "./Service.module.css";
import { isoDay, useBizFormat } from "../../bizShared";
import { CrmContext } from "../crmShared";
import { StarterBanner } from "./starters";
import { Badge, ConfirmButton, ContactField, listOf, Ref, useCall, useCrm, useCrmText, useGet } from "./svc";

// «چک‌لیست‌ها» (2026-10), nexxacrm's checklist: lists of to-dos with
// sub-items, a star, a priority, a due date and a repeat (a repeating item
// makes its next one when ticked). A list can be a template - the WHO
// surgical safety checklist, a pre-visit list - started anew for one
// patient. Deleting a list keeps its items, as loose items.

const REPEATS = ["none", "daily", "weekly", "monthly"] as const;
type Repeat = (typeof REPEATS)[number];
type List = { _id: string; name: string; color?: string; isTemplate: boolean; contact?: { _id: string; name?: string; phone: string } | null };
type Item = { _id: string; list?: string; parent?: string; title: string; note?: string; priority: number; repeat: Repeat; dueAt?: string; starred: boolean; done: boolean };
const repeatKey: Record<Repeat, string> = { none: "crmeRepNone", daily: "crmeRepDaily", weekly: "crmeRepWeekly", monthly: "crmeRepMonthly" };
const prioKey = ["crmePrLow", "crmePrNormal", "crmePrHigh", "crmePrUrgent"];
const LOOSE = "loose";
const STARRED = "starred";

const ItemPopup = ({ item, lists, onDone }: { item: Item; lists: List[]; onDone: () => unknown }) => {
  const t = useCrmText();
  const call = useCall();
  const { closePopup } = usePopup();
  const [title, setTitle] = useState(item.title);
  const [note, setNote] = useState(item.note || "");
  const [priority, setPriority] = useState(item.priority);
  const [repeat, setRepeat] = useState<Repeat>(item.repeat);
  const [due, setDue] = useState<Date | null>(item.dueAt ? new Date(item.dueAt) : null);
  const [list, setList] = useState(item.list || "");
  const save = async () => {
    if (await call("PATCH", `/checklist-items/${item._id}`, { title, note: note || null, priority, repeat, dueAt: due ? isoDay(due) : null, list: list || null })) {
      closePopup("CrmeItem");
      onDone();
    }
  };
  return (
    <PopupCard title={t("crmeEditItem")}>
      <div className={classes.popup}>
        <div className={s.stepFields}>
          <label className={`${classes.field} ${s.wideField}`}>
            {t("crmeItemTitle")}
            <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={300} />
          </label>
          <label className={classes.field}>
            {t("crmePriority")}
            <select value={priority} onChange={(e) => setPriority(Number(e.target.value))}>
              {prioKey.map((k, i) => (
                <option key={k} value={i}>
                  {t(k)}
                </option>
              ))}
            </select>
          </label>
          <label className={classes.field}>
            {t("crmeRepeat")}
            <select value={repeat} onChange={(e) => setRepeat(e.target.value as Repeat)}>
              {REPEATS.map((r) => (
                <option key={r} value={r}>
                  {t(repeatKey[r])}
                </option>
              ))}
            </select>
          </label>
          <div className={classes.field}>
            <DateInput title={t("crmeDueDate")} defaultValue={due || undefined} onChange={(d) => setDue(d)} />
          </div>
          {!item.parent && (
            <label className={classes.field}>
              {t("crmeList")}
              <select value={list} onChange={(e) => setList(e.target.value)}>
                <option value="">{t("crmeLoose")}</option>
                {lists.map((l) => (
                  <option key={l._id} value={l._id}>
                    {l.name}
                  </option>
                ))}
              </select>
            </label>
          )}
          <label className={`${classes.field} ${s.wideField}`}>
            {t("crmNote")}
            <textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} maxLength={1000} />
          </label>
        </div>
        {repeat !== "none" && !due && <p className={s.hint}>{t("crmeRepeatHint")}</p>}
        <div className={classes.actions}>
          <button type="button" className={classes.ghost} onClick={() => closePopup("CrmeItem")}>
            {t("bizCancel")}
          </button>
          <button type="button" className={classes.primary} disabled={!title.trim()} onClick={save}>
            {t("bizSave")}
          </button>
        </div>
      </div>
    </PopupCard>
  );
};

const StartPopup = ({ list, onDone }: { list: List; onDone: (id?: string) => unknown }) => {
  const t = useCrmText();
  const call = useCall();
  const { closePopup } = usePopup();
  const [contact, setContact] = useState<Ref>(null);
  return (
    <PopupCard title={t("crmeStartFor", [list.name])}>
      <div className={classes.popup}>
        <ContactField value={contact} onChange={setContact} />
        <div className={classes.actions}>
          <button type="button" className={classes.ghost} onClick={() => closePopup("CrmeStart")}>
            {t("bizCancel")}
          </button>
          <button
            type="button"
            className={classes.primary}
            disabled={!contact}
            onClick={async () => {
              const r = await call<{ _id: string }>("POST", `/checklists/${list._id}/start`, { contact: contact!._id });
              if (r) {
                closePopup("CrmeStart");
                onDone(r._id);
              }
            }}
          >
            {t("crmeStart")}
          </button>
        </div>
      </div>
    </PopupCard>
  );
};

const CrmChecklists = () => {
  const t = useCrmText();
  const f = useBizFormat();
  const ctx = useCrm();
  const { canWrite } = ctx;
  const call = useCall();
  const { setPopup } = usePopup();
  const { data, error, mutate } = useGet<{ lists: List[]; items: Item[] } | null>("/checklists", (d) => (d && typeof d === "object" ? (d as never) : null));
  const [sel, setSel] = useState<string>(LOOSE);
  const [newTitle, setNewTitle] = useState("");
  const [sub, setSub] = useState<{ parent: string; title: string } | null>(null);
  const [listName, setListName] = useState("");
  const [asTemplate, setAsTemplate] = useState(false);
  const lists = listOf<List>(data?.lists);
  const items = listOf<Item>(data?.items);
  const current = lists.find((l) => l._id === sel);
  const shown = items.filter((i) => (sel === STARRED ? i.starred : sel === LOOSE ? !i.list : i.list === sel));
  const top = sel === STARRED ? shown : shown.filter((i) => !i.parent);
  const childrenOf = (id: string) => items.filter((i) => i.parent === id);
  const wrap = (n: React.ReactNode) => <CrmContext.Provider value={ctx}>{n}</CrmContext.Provider>;
  const add = async (title: string, parent?: string) => {
    const list = sel === LOOSE || sel === STARRED ? null : sel;
    return !!(await call("POST", "/checklist-items", { title, list, ...(parent ? { parent } : {}) }, false));
  };
  const row = (i: Item, isSub = false) => {
    const late = !i.done && i.dueAt && new Date(i.dueAt).getTime() < Date.now();
    return (
      <li key={i._id} className={`${s.item} ${isSub ? s.itemSub : ""}`}>
        <input type="checkbox" checked={i.done} aria-label={t("crmMarkDone")} onChange={async () => (await call("POST", `/checklist-items/${i._id}/toggle`, undefined, false)) && mutate()} />
        <button type="button" className={`${s.itemTitle} ${i.done ? s.taskDone : ""}`} onClick={() => setPopup("CrmeItem", wrap(<ItemPopup item={i} lists={lists} onDone={() => mutate()} />))}>
          {i.title}
        </button>
        {i.priority > 1 && <Badge tone={i.priority === 3 ? "bad" : "warn"}>{t(prioKey[i.priority])}</Badge>}
        {i.repeat !== "none" && <Badge tone="muted">{t(repeatKey[i.repeat])}</Badge>}
        {i.dueAt && <Badge tone={late ? "bad" : undefined}>{f.date(i.dueAt)}</Badge>}
        <button
          type="button"
          className={`${s.star} ${i.starred ? s.starOn : ""}`}
          aria-label={t("crmeStar")}
          aria-pressed={i.starred}
          onClick={async () => (await call("PATCH", `/checklist-items/${i._id}`, { starred: !i.starred }, false)) && mutate()}
        >
          <StarIcon />
        </button>
        {!isSub && (
          <button type="button" className={crm.linkButton} onClick={() => setSub({ parent: i._id, title: "" })}>
            {t("crmeAddSub")}
          </button>
        )}
        <ConfirmButton className={crm.linkDanger} onConfirm={async () => (await call("DELETE", `/checklist-items/${i._id}`, undefined, false)) && mutate()}>
          ×
        </ConfirmButton>
      </li>
    );
  };
  return (
    <HandleLoading data={!!data} error={error}>
      <StarterBanner onSeeded={() => mutate()} />
      <div className={s.lists}>
        <section className={classes.card}>
          <nav className={s.listNav} aria-label={t("crmeLists")}>
            <button type="button" className={sel === LOOSE ? s.listOn : ""} onClick={() => setSel(LOOSE)}>
              <span>{t("crmeLoose")}</span>
              <span className={classes.muted}>{f.money(items.filter((i) => !i.list && !i.done).length)}</span>
            </button>
            <button type="button" className={sel === STARRED ? s.listOn : ""} onClick={() => setSel(STARRED)}>
              <span>{t("crmeStarred")}</span>
              <span className={classes.muted}>{f.money(items.filter((i) => i.starred && !i.done).length)}</span>
            </button>
            {lists.map((l) => (
              <button key={l._id} type="button" className={sel === l._id ? s.listOn : ""} onClick={() => setSel(l._id)}>
                <span>
                  {l.name}
                  {l.isTemplate ? ` · ${t("crmeTemplateBadge")}` : ""}
                </span>
                <span className={classes.muted}>{f.money(items.filter((i) => i.list === l._id && !i.done).length)}</span>
              </button>
            ))}
          </nav>
          {canWrite && (
            <div className={s.stack}>
              <input value={listName} onChange={(e) => setListName(e.target.value)} placeholder={t("crmeListName")} maxLength={120} />
              <label className={s.row}>
                <input type="checkbox" checked={asTemplate} onChange={(e) => setAsTemplate(e.target.checked)} />
                {t("crmeAsTemplate")}
              </label>
              <button
                type="button"
                className={classes.ghost}
                disabled={!listName.trim()}
                onClick={async () => {
                  const r = await call<{ _id: string }>("POST", "/checklists", { name: listName, isTemplate: asTemplate });
                  if (r) {
                    setListName("");
                    setAsTemplate(false);
                    setSel(r._id);
                    mutate();
                  }
                }}
              >
                {t("crmeNewList")}
              </button>
            </div>
          )}
        </section>
        <section className={classes.card}>
          <div className={classes.cardHead}>
            <div className={s.stack}>
              <h2 className={classes.cardTitle}>{current?.name || t(sel === STARRED ? "crmeStarred" : "crmeLoose")}</h2>
              {current?.contact && <span className={classes.muted}>{current.contact.name || current.contact.phone}</span>}
              {current?.isTemplate && <span className={s.hint}>{t("crmeTemplateHint")}</span>}
            </div>
            {current && (
              <div className={s.row}>
                {current.isTemplate && (
                  <button type="button" className={classes.primary} onClick={() => setPopup("CrmeStart", wrap(<StartPopup list={current} onDone={(id) => { mutate(); if (id) setSel(id); }} />))}>
                    {t("crmeStartForPatient")}
                  </button>
                )}
                {canWrite && (
                  <ConfirmButton onConfirm={async () => { if (await call("DELETE", `/checklists/${current._id}`)) { setSel(LOOSE); mutate(); } }}>{t("crmeDeleteList")}</ConfirmButton>
                )}
              </div>
            )}
          </div>
          {sel !== STARRED && (
            <div className={s.row}>
              <input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                maxLength={300}
                placeholder={t("crmeNewItem")}
                onKeyDown={async (e) => {
                  if (e.key === "Enter" && newTitle.trim() && (await add(newTitle.trim()))) {
                    setNewTitle("");
                    mutate();
                  }
                }}
              />
              <button type="button" className={classes.ghost} disabled={!newTitle.trim()} onClick={async () => { if (await add(newTitle.trim())) { setNewTitle(""); mutate(); } }}>
                {t("bizAdd")}
              </button>
            </div>
          )}
          {!top.length ? (
            <p className={classes.empty}>{t("crmeNoItems")}</p>
          ) : (
            <ul className={s.items}>
              {top.map((i) => (
                <li key={i._id} className={s.stack}>
                  <ul className={s.items}>
                    {row(i)}
                    {sel !== STARRED && childrenOf(i._id).map((c) => row(c, true))}
                    {sub?.parent === i._id && (
                      <li className={`${s.item} ${s.itemSub}`}>
                        <input value={sub.title} autoFocus maxLength={300} onChange={(e) => setSub({ ...sub, title: e.target.value })} placeholder={t("crmeNewSub")} />
                        <button type="button" className={classes.ghost} disabled={!sub.title.trim()} onClick={async () => { if (await add(sub.title.trim(), i._id)) { setSub(null); mutate(); } }}>
                          {t("bizAdd")}
                        </button>
                        <button type="button" className={crm.linkButton} onClick={() => setSub(null)}>
                          {t("bizCancel")}
                        </button>
                      </li>
                    )}
                  </ul>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </HandleLoading>
  );
};

export default CrmChecklists;
