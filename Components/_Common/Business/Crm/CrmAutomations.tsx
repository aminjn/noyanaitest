"use client";

import { useState } from "react";
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
import {
  automationKey,
  automationKindsOf,
  CrmAutomation,
  CrmAutomationKind,
  CrmContext,
  CrmRules,
  CrmSegment,
  emptyRules,
  errText,
  phoneText,
  sessionTypeKey,
  sessionTypes,
  templateStatusKey,
  useCrm,
  useCrmTemplates,
  useCrmText,
  useHourLabel,
} from "./crmShared";
import CrmRulesForm, { TagPicker, useRulesSummary } from "./CrmRulesForm";

const EDIT = "CrmAutomationEdit";
const LOG = "CrmAutomationLog";
const HOURS = Array.from({ length: 14 }, (_, i) => 8 + i);

const errorKey: Record<string, string> = {
  template: "crmAutoErrTemplate",
  module: "crmAutoErrModule",
  noCredit: "crmAutoErrCredit",
  dailyCap: "crmAutoErrCap",
  profile: "crmAutoErrProfile",
};

// the delay field's label and the card's summary of a journey
const delayLabel = (kind: CrmAutomationKind) => {
  const k = automationKey[kind];
  return k.delayKey || (k.unit === "hours" ? "crmAutoDelayHours" : kind === "winback" ? "crmAutoDelayLapse" : "crmAutoDelayDays");
};
const afterLabel = (kind: CrmAutomationKind) => {
  const k = automationKey[kind];
  return k.afterKey || (k.unit === "hours" ? "crmAutoAfterHours" : kind === "winback" ? "crmAutoAfterLapse" : "crmAutoAfterDays");
};

// the id of the segment an automation targets (a list gives it populated)
const segmentIdOf = (v: CrmAutomation["segment"]) => (!v ? "" : typeof v === "string" ? v : v._id || "");

const Edit = ({ a, onDone }: { a: CrmAutomation; onDone: () => unknown }) => {
  const t = useCrmText();
  const { api, panel } = useCrm();
  const hourLabel = useHourLabel();
  const { closePopup } = usePopup();
  const pushNotification = useNotification();
  const { data: templates } = useCrmTemplates();
  const k = automationKey[a.kind] || automationKey.recall;
  const [name, setName] = useState(a.name);
  const [template, setTemplate] = useState(a.template?._id || "");
  const [delay, setDelay] = useState(String(a.delay));
  const [types, setTypes] = useState<string[]>(a.sessionTypes || []);
  const [rules, setRules] = useState<CrmRules>({ ...emptyRules(), ...(a.audience || {}) });
  // a saved segment the patients must be in (the rules below narrow it)
  const [segment, setSegment] = useState(segmentIdOf(a.segment));
  const { data: segs } = useSWR<CrmSegment[]>(`${API}${api}/segments`, (url: string) =>
    fetcher({ url }).then((r) => asArray<CrmSegment>((r?.data as { saved?: unknown } | undefined)?.saved)),
  );
  const [wFrom, setWFrom] = useState(a.windowFrom);
  const [wUntil, setWUntil] = useState(a.windowUntil);
  const [gap, setGap] = useState(String(a.gapDays));
  const [once, setOnce] = useState(a.oncePerYear);
  const [busy, setBusy] = useState(false);
  const num = (s: string) => Math.max(0, Math.round(Number(s.replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))) || 0));
  const save = async () => {
    setBusy(true);
    try {
      await fetcher({
        url: `${API}${api}/automations/${a._id}`,
        method: "PATCH",
        payload: {
          name: name.trim(),
          template: template || null,
          delay: num(delay),
          sessionTypes: types,
          audience: rules,
          segment: segment || null,
          windowFrom: wFrom,
          windowUntil: wUntil,
          gapDays: num(gap),
          oncePerYear: once,
        },
      });
      pushNotification(t("bizSaved"), "Success");
      closePopup(EDIT);
      onDone();
    } catch (err) {
      pushNotification(errText(err), "Error");
      setBusy(false);
    }
  };
  const tpl = asArray<{ _id: string; name: string; status: string; category: string }>(templates);
  const chosen = tpl.find((x) => x._id === template);
  return (
    <PopupCard size="wide" title={t(k.title)}>
      <div className={classes.popup}>
        <p className={classes.muted}>{t(k.hint)}</p>
        <div className={classes.form}>
          <label className={classes.field}>
            {t("crmAutoName")}
            <input value={name} onChange={(e) => setName(e.target.value)} maxLength={80} />
          </label>
          <label className={classes.field}>
            {t("crmTemplate")}
            <select value={template} onChange={(e) => setTemplate(e.target.value)}>
              <option value="">{t("bizSelect")}</option>
              {tpl.map((x) => (
                <option key={x._id} value={x._id}>
                  {x.name} · {t(templateStatusKey[x.status as keyof typeof templateStatusKey] || "crmStDraft")}
                </option>
              ))}
            </select>
          </label>
          {a.kind !== "birthday" && (
            <label className={classes.field}>
              {t(delayLabel(a.kind))}
              <input value={delay} onChange={(e) => setDelay(e.target.value)} inputMode="numeric" />
            </label>
          )}
          <label className={classes.field}>
            {t("crmAutoGap")}
            <input value={gap} onChange={(e) => setGap(e.target.value)} inputMode="numeric" />
          </label>
          <label className={classes.field}>
            {t("crmWindowFrom")}
            <select value={wFrom} onChange={(e) => setWFrom(Number(e.target.value))}>
              {HOURS.slice(0, -1).map((h) => (
                <option key={h} value={h}>
                  {hourLabel(h)}
                </option>
              ))}
            </select>
          </label>
          <label className={classes.field}>
            {t("crmWindowUntil")}
            <select value={wUntil} onChange={(e) => setWUntil(Number(e.target.value))}>
              {HOURS.slice(1).map((h) => (
                <option key={h} value={h}>
                  {hourLabel(h)}
                </option>
              ))}
            </select>
          </label>
        </div>
        {!!chosen && chosen.status !== "Approved" && <p className={crm.warnLine}>{t("crmAutoTplNotApproved")}</p>}
        {!tpl.length && (
          <p className={classes.muted}>
            {t("crmAutoNoTemplates")}{" "}
            <Link href={`${panel}/crm/templates`} className={crm.linkButton}>
              {t("crmNavTemplates")}
            </Link>
          </p>
        )}
        {a.kind === "recall" && (
          <div className={crm.chips} role="group" aria-label={t("crmAutoSessionTypes")}>
            <span className={classes.muted}>{t("crmAutoSessionTypes")}:</span>
            {sessionTypes.map((s) => (
              <button
                key={s}
                type="button"
                aria-pressed={types.includes(s)}
                className={`${crm.chip} ${types.includes(s) ? crm.chipOn : ""}`}
                onClick={() => setTypes((x) => (x.includes(s) ? x.filter((y) => y !== s) : [...x, s]))}
              >
                {t(sessionTypeKey[s])}
              </button>
            ))}
          </div>
        )}
        {a.kind === "chronic" ? (
          <TagPicker title={t("crmAutoChronicTags")} value={rules.tags} onChange={(v) => setRules((r) => ({ ...r, tags: v }))} />
        ) : null}
        <section className={crm.subCard}>
          <span className={classes.cardTitle}>{t("crmAutoAudience")}</span>
          <label className={classes.field}>
            {t("crmAutoSegment")}
            <select value={segment} onChange={(e) => setSegment(e.target.value)}>
              <option value="">{t("crmAutoSegmentNone")}</option>
              {asArray<CrmSegment>(segs).map((g) => (
                <option key={g._id} value={g._id}>
                  {g.name || "—"}
                </option>
              ))}
            </select>
          </label>
          {!!segment && <p className={classes.muted}>{t("crmAutoSegmentHint")}</p>}
          <CrmRulesForm rules={rules} onChange={setRules} compact hideTags={a.kind === "chronic"} />
        </section>
        {(a.kind === "birthday" || a.kind === "winback" || a.kind === "chronic") && (
          <label className={crm.check}>
            <input type="checkbox" checked={once} onChange={(e) => setOnce(e.target.checked)} />
            {t("crmAutoOncePerYear")}
          </label>
        )}
        <p className={classes.muted}>{t("crmAutoSafety")}</p>
        <div className={classes.actions}>
          <button type="button" className={classes.ghost} onClick={() => closePopup(EDIT)}>
            {t("bizCancel")}
          </button>
          <button
            type="button"
            className={classes.primary}
            disabled={busy || name.trim().length < 2 || wUntil <= wFrom || (a.kind === "chronic" && !rules.tags.length)}
            onClick={save}
          >
            {t("bizSave")}
          </button>
        </div>
      </div>
    </PopupCard>
  );
};

type Log = {
  automation: CrmAutomation;
  dueNow: number;
  dueWeek: number;
  inWindow: boolean;
  upcoming: { name?: string; phone: string; dueAt: string }[];
  log: { _id: string; contact?: { _id: string; name?: string } | null; phone: string; status: string; clicks: number; bookedAt?: string; sentAt?: string; createdAt: string }[];
};

const LogView = ({ id }: { id: string }) => {
  const t = useCrmText();
  const f = useBizFormat();
  const { api, panel } = useCrm();
  const { data, error } = useSWR<Log>(`${API}${api}/automations/${id}`, (url: string) => fetcher({ url }).then((res) => res.data as Log));
  return (
    <PopupCard size="wide" title={data?.automation?.name || t("crmAutoLog")}>
      <div className={classes.popup}>
        <HandleLoading data={!!data} error={error}>
          {!!data && (
            <>
              <div className={classes.tiles}>
                <div className={classes.tile}>
                  <span className={classes.tileLabel}>{t("crmAutoDueNow")}</span>
                  <span className={classes.tileValue}>{f.money(data.dueNow)}</span>
                </div>
                <div className={classes.tile}>
                  <span className={classes.tileLabel}>{t("crmAutoDueWeek")}</span>
                  <span className={classes.tileValue}>{f.money(data.dueWeek)}</span>
                </div>
                <div className={classes.tile}>
                  <span className={classes.tileLabel}>{t("crmSent")}</span>
                  <span className={classes.tileValue}>{f.money(data.automation.sentCount)}</span>
                </div>
              </div>
              {data.upcoming.length > 0 && (
                <>
                  <span className={classes.cardTitle}>{t("crmAutoUpcoming")}</span>
                  <ul className={crm.miniList}>
                    {data.upcoming.map((u, i) => (
                      <li key={i}>
                        <span className={crm.miniMain}>
                          <span className={crm.fuText}>{u.name || phoneText(u.phone)}</span>
                        </span>
                        <span className={classes.badge}>{f.date(u.dueAt)}</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
              <span className={classes.cardTitle}>{t("crmAutoLog")}</span>
              {data.log.length === 0 ? (
                <p className={classes.empty}>{t("bizEmpty")}</p>
              ) : (
                <div className={classes.tableWrap}>
                  <table className={classes.table}>
                    <thead>
                      <tr>
                        <th>{t("crmName")}</th>
                        <th>{t("status")}</th>
                        <th className={classes.num}>{t("crmClicked")}</th>
                        <th>{t("crmBooked")}</th>
                        <th>{t("bizDate")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.log.map((m) => (
                        <tr key={m._id}>
                          <td className={classes.wrap}>
                            {m.contact ? (
                              <Link href={`${panel}/crm/contacts/${m.contact._id}`} className={crm.linkButton}>
                                {m.contact.name || phoneText(m.phone)}
                              </Link>
                            ) : (
                              phoneText(m.phone)
                            )}
                          </td>
                          <td>
                            <span className={`${classes.badge} ${m.status === "sent" ? crm.badgeOk : m.status === "failed" ? crm.badgeBad : crm.badgeMuted}`}>
                              {t(m.status === "sent" ? "crmMsgSent" : m.status === "failed" ? "crmMsgFailed" : "crmMsgQueued")}
                            </span>
                          </td>
                          <td className={classes.num}>{m.clicks ? f.money(m.clicks) : "—"}</td>
                          <td>{m.bookedAt ? f.date(m.bookedAt) : "—"}</td>
                          <td>{f.date(m.sentAt || m.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </HandleLoading>
      </div>
    </PopupCard>
  );
};

// Automations (2026-10): the rule-based patient journeys - recall after a
// visit, thank-you and review request, birthday, missed-visit
// re-engagement, lapsed-patient win-back, chronic patients' periodic
// check-up - each switched on and off here, with its template, timing,
// audience, send window and per-patient rules, and its log. They send only
// approved templates, never to an opted-out patient, never twice for one
// event, and only what the quota and the wallet cover.
const CrmAutomations = () => {
  const t = useCrmText();
  const f = useBizFormat();
  const ctx = useCrm();
  const hourLabel = useHourLabel();
  const summary = useRulesSummary();
  const { setPopup } = usePopup();
  const pushNotification = useNotification();
  const { data, error, mutate } = useSWR<CrmAutomation[]>(`${API}${ctx.api}/automations`, (url: string) =>
    fetcher({ url }).then((res) => asArray<CrmAutomation>(res.data)),
  );
  const [busy, setBusy] = useState("");
  const withCtx = (n: React.ReactNode) => <CrmContext.Provider value={ctx}>{n}</CrmContext.Provider>;
  const edit = (a: CrmAutomation) => setPopup(EDIT, withCtx(<Edit a={a} onDone={() => mutate()} />));
  const add = async (kind: CrmAutomationKind) => {
    try {
      const res = await fetcher({ url: `${API}${ctx.api}/automations`, method: "POST", payload: { kind, name: t(automationKey[kind].title) } });
      await mutate();
      edit(res.data as CrmAutomation);
    } catch (err) {
      pushNotification(errText(err), "Error");
    }
  };
  const toggle = async (a: CrmAutomation) => {
    setBusy(a._id);
    try {
      await fetcher({ url: `${API}${ctx.api}/automations/${a._id}/toggle`, method: "POST", payload: { enabled: !a.enabled } });
      pushNotification(t(a.enabled ? "crmAutoOff" : "crmAutoOn"), "Success");
      mutate();
    } catch (err) {
      pushNotification(errText(err), "Error");
    } finally {
      setBusy("");
    }
  };
  const remove = async (a: CrmAutomation) => {
    if (!window.confirm(t("crmAutoDeleteConfirm", [a.name]))) return;
    try {
      await fetcher({ url: `${API}${ctx.api}/automations/${a._id}`, method: "DELETE" });
      mutate();
    } catch (err) {
      pushNotification(errText(err), "Error");
    }
  };
  const rows = asArray<CrmAutomation>(data);
  const delayText = (a: CrmAutomation) =>
    a.kind === "birthday"
      ? t("crmAutoOnBirthday")
      : t(afterLabel(a.kind), [f.money(a.delay)]);
  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <div className={crm.autoGrid}>
          {automationKindsOf(ctx.node).map((kind) => {
            const k = automationKey[kind];
            const list = rows.filter((a) => a.kind === kind);
            return (
              <section key={kind} className={`${classes.card} ${crm.autoCard}`}>
                <div className={classes.cardHead}>
                  <span className={classes.cardTitle}>{t(k.title)}</span>
                  {ctx.canWrite && (
                    <button type="button" className={crm.linkButton} onClick={() => add(kind)}>
                      {t(list.length ? "crmAutoAddAnother" : "crmAutoSetUp")}
                    </button>
                  )}
                </div>
                <p className={classes.muted}>{t(k.hint)}</p>
                {list.map((a) => (
                  <div key={a._id} className={crm.autoItem}>
                    <div className={crm.autoHead}>
                      <span className={crm.fuText}>{a.name}</span>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={a.enabled}
                        aria-label={a.name}
                        disabled={!ctx.canSend || busy === a._id}
                        className={`${crm.switch} ${a.enabled ? crm.switchOn : ""}`}
                        onClick={() => toggle(a)}
                      >
                        <span />
                      </button>
                    </div>
                    <span className={classes.muted}>
                      {delayText(a)} · {t("crmAutoWindow", [hourLabel(a.windowFrom), hourLabel(a.windowUntil)])}
                      {a.sessionTypes?.length ? ` · ${a.sessionTypes.map((s) => t(sessionTypeKey[s] || s)).join(" · ")}` : ""}
                    </span>
                    {a.segment && typeof a.segment === "object" && <span className={classes.muted}>{t("crmAutoSegmentOn", [a.segment.name || "—"])}</span>}
                    {summary(a.audience).length > 0 && <span className={classes.muted}>{summary(a.audience).join(" · ")}</span>}
                    <span className={crm.tags}>
                      {a.template ? (
                        <span className={`${classes.badge} ${a.template.status === "Approved" ? crm.badgeOk : a.template.status === "Rejected" ? crm.badgeBad : crm.badgeWarn}`}>
                          {a.template.name} · {t(templateStatusKey[a.template.status] || "crmStDraft")}
                        </span>
                      ) : (
                        <span className={`${classes.badge} ${crm.badgeWarn}`}>{t("crmAutoNoTemplate")}</span>
                      )}
                    </span>
                    <span className={crm.autoStats}>
                      {t("crmAuto30", [f.money(a.last30?.sent), f.money(a.last30?.clicked), f.money(a.last30?.booked)])}
                    </span>
                    {!!a.lastError && a.enabled && <span className={crm.warnLine}>{t(errorKey[a.lastError] || "crmAutoErrTemplate")}</span>}
                    <div className={crm.rowActions}>
                      <button type="button" className={crm.linkButton} onClick={() => setPopup(LOG, withCtx(<LogView id={a._id} />))}>
                        {t("crmAutoLog")}
                      </button>
                      {ctx.canWrite && (
                        <>
                          <button type="button" className={crm.linkButton} onClick={() => edit(a)}>
                            {t("bizEdit")}
                          </button>
                          <button type="button" className={crm.linkDanger} onClick={() => remove(a)}>
                            {t("bizDelete")}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </section>
            );
          })}
        </div>
      )}
    </HandleLoading>
  );
};

export default CrmAutomations;
