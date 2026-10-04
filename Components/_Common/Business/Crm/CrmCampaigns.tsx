"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
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
import { asArray, useBizFormat } from "../bizShared";
import {
  CrmAudience,
  CrmCampaign,
  CrmContext,
  CrmEstimate,
  CrmRules,
  CrmSegment,
  emptyRules,
  errText,
  presetKey,
  statusKey,
  useCrm,
  useCrmTemplates,
  useCrmText,
  useHourLabel,
} from "./crmShared";
import CrmRulesForm from "./CrmRulesForm";
import SmsTextField from "./SmsTextField";

const POPUP = "CrmCampaign";
const HOURS = Array.from({ length: 14 }, (_, i) => 8 + i);

export const campaignTone = (s: CrmCampaign["status"]) =>
  s === "Sent" || s === "Approved" ? crm.badgeOk : s === "Rejected" ? crm.badgeBad : s === "Pending" ? crm.badgeWarn : "";

type Mode = "segment" | "rules" | "selection";
const modeKey: Record<Mode, string> = { segment: "crmNavSegments", rules: "crmAudRules", selection: "crmAudSelection" };

// The campaign form (2026-10): the text (from a template or typed, with
// variables and the tracked link), the audience - a segment, rules or a
// hand-picked selection, always only this centre's own patients who have
// not opted out - when to send (now or a chosen day and hour, inside its
// own window within 08-21), and a live estimate of reach and cost against
// the plan's quota and the wallet. Saved as a draft; "send for approval"
// puts it in the super admin's queue.
const CampaignForm = ({
  campaign,
  initial,
  onDone,
}: {
  campaign?: CrmCampaign;
  initial?: { segment?: string; contactIds?: string[] };
  onDone: () => unknown;
}) => {
  const t = useCrmText();
  const f = useBizFormat();
  const { api, canSend } = useCrm();
  const popup = usePopup();
  const close = () => popup.closePopup(POPUP);
  const pushNotification = useNotification();
  const { data: templates } = useCrmTemplates();
  const hourLabel = useHourLabel();
  const { data: segs } = useSWR<{ presets: CrmSegment[]; saved: CrmSegment[] }>(`${API}${api}/segments`, (url: string) =>
    fetcher({ url }).then((res) => res.data as { presets: CrmSegment[]; saved: CrmSegment[] }),
  );
  const a = campaign?.audience;
  const [name, setName] = useState(campaign?.name || "");
  const [text, setText] = useState(campaign?.text || "");
  const [template, setTemplate] = useState(campaign?.template || "");
  const [mode, setMode] = useState<Mode>(
    initial?.contactIds?.length || a?.contactIds?.length ? "selection" : initial?.segment || a?.segment ? "segment" : "rules",
  );
  const [segment, setSegment] = useState(a?.segment || initial?.segment || "");
  const [contactIds] = useState<string[]>(a?.contactIds || initial?.contactIds || []);
  const [rules, setRules] = useState<CrmRules>(() => {
    const { segment: _s, contactIds: _c, ...r } = (a || {}) as CrmAudience; // eslint-disable-line @typescript-eslint/no-unused-vars
    return { ...emptyRules(), ...r };
  });
  const [later, setLater] = useState(!!campaign?.sendAt);
  const [day, setDay] = useState<Date | null>(campaign?.sendAt ? new Date(campaign.sendAt) : null);
  const [hour, setHour] = useState(campaign?.sendAt ? new Date(campaign.sendAt).getHours() : 10);
  const [wFrom, setWFrom] = useState(campaign?.windowFrom ?? 8);
  const [wUntil, setWUntil] = useState(campaign?.windowUntil ?? 21);
  const [estimate, setEstimate] = useState<CrmEstimate | null>(null);
  const [busy, setBusy] = useState(false);
  // a preset segment is sent as its rules (it is not stored)
  const presetRules = (id: string) => asArray<CrmSegment>(segs?.presets).find((s) => s._id === id)?.rules;
  const audience: CrmAudience =
    mode === "selection"
      ? { ...emptyRules(), contactIds }
      : mode === "segment"
        ? segment.startsWith("preset:")
          ? { ...emptyRules(), ...(presetRules(segment) || {}) }
          : { ...emptyRules(), segment: segment || null }
        : rules;
  const key = JSON.stringify([text, audience]);
  const first = useRef(true);
  useEffect(() => {
    const h = setTimeout(
      () => {
        first.current = false;
        fetcher({ url: `${API}${api}/campaigns/estimate`, method: "POST", payload: { text, audience: JSON.parse(key)[1] } })
          .then((res) => setEstimate(res.data as CrmEstimate))
          .catch(() => setEstimate(null));
      },
      first.current ? 0 : 500,
    );
    return () => clearTimeout(h);
  }, [api, key, text]);
  const sendAt = (() => {
    if (!later || !day) return null;
    const d = new Date(day);
    d.setHours(hour, 0, 0, 0);
    return d.toISOString();
  })();
  const valid = name.trim().length >= 2 && text.trim().length >= 5 && (mode !== "segment" || !!segment) && wUntil > wFrom && (!later || !!sendAt);
  const pickTemplate = (id: string) => {
    setTemplate(id);
    const tx = asArray<{ _id: string; text: string }>(templates).find((x) => x._id === id)?.text;
    if (tx) setText(tx);
  };
  const save = async (submit: boolean) => {
    if (busy || !valid) return;
    setBusy(true);
    try {
      const res = await fetcher({
        url: campaign ? `${API}${api}/campaigns/${campaign._id}` : `${API}${api}/campaigns`,
        method: campaign ? "PATCH" : "POST",
        payload: { name: name.trim(), text: text.trim(), audience, template: template || null, sendAt, windowFrom: wFrom, windowUntil: wUntil },
      });
      const id = (res.data as { _id?: string })?._id || campaign?._id;
      close();
      onDone();
      if (submit && id) {
        await fetcher({ url: `${API}${api}/campaigns/${id}/submit`, method: "POST" });
        pushNotification(t("crmSubmitted"), "Success");
        onDone();
      } else pushNotification(t("bizSaved"), "Success");
    } catch (err) {
      pushNotification(errText(err), "Error");
      setBusy(false);
    }
  };
  return (
    <PopupCard size="wide" title={campaign ? campaign.name : t("crmNewCampaign")}>
      <div className={classes.popup}>
        {campaign?.status === "Rejected" && campaign.rejectReason && (
          <p className={crm.reject}>
            {t("crmRejectReason")}: {campaign.rejectReason}
          </p>
        )}
        <div className={crm.campaignGrid}>
          <div className={classes.main}>
            <div className={classes.form}>
              <label className={classes.field}>
                {t("crmCampaignName")}
                <input value={name} onChange={(e) => setName(e.target.value)} maxLength={120} placeholder={t("crmCampaignNameHint")} />
              </label>
              <label className={classes.field}>
                {t("crmFromTemplate")}
                <select value={template} onChange={(e) => pickTemplate(e.target.value)}>
                  <option value="">{t("crmNoTemplate")}</option>
                  {asArray<{ _id: string; name: string }>(templates).map((x) => (
                    <option key={x._id} value={x._id}>
                      {x.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <SmsTextField value={text} onChange={setText} label={t("crmCampaignText")} showPreview={false} />
            <p className={classes.muted}>{t("crmTextRules")}</p>

            <section className={crm.subCard}>
              <div className={classes.cardHead}>
                <span className={classes.cardTitle}>{t("crmAudience")}</span>
                <div className={classes.segmented} role="tablist">
                  {(["segment", "rules", ...(contactIds.length ? ["selection"] : [])] as Mode[]).map((m) => (
                    <button key={m} type="button" role="tab" aria-selected={mode === m} className={mode === m ? classes.on : ""} onClick={() => setMode(m)}>
                      {t(modeKey[m])}
                    </button>
                  ))}
                </div>
              </div>
              {mode === "segment" && (
                <label className={classes.field}>
                  {t("crmNavSegments")}
                  <select value={segment} onChange={(e) => setSegment(e.target.value)}>
                    <option value="">{t("bizSelect")}</option>
                    {asArray<CrmSegment>(segs?.saved).map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.name} ({f.money(s.reachable)})
                      </option>
                    ))}
                    {asArray<CrmSegment>(segs?.presets).map((s) => (
                      <option key={s._id} value={s._id}>
                        {t(presetKey[s.preset || ""] || "")} ({f.money(s.reachable)})
                      </option>
                    ))}
                  </select>
                </label>
              )}
              {mode === "rules" && <CrmRulesForm rules={rules} onChange={setRules} showCount={false} compact />}
              {mode === "selection" && <p className={classes.muted}>{t("crmSelectionN", [f.money(contactIds.length)])}</p>}
            </section>

            <section className={crm.subCard}>
              <span className={classes.cardTitle}>{t("crmWhen")}</span>
              <div className={classes.segmented} role="tablist">
                <button type="button" role="tab" aria-selected={!later} className={!later ? classes.on : ""} onClick={() => setLater(false)}>
                  {t("crmSendAsap")}
                </button>
                <button type="button" role="tab" aria-selected={later} className={later ? classes.on : ""} onClick={() => setLater(true)}>
                  {t("crmSendLater")}
                </button>
              </div>
              <div className={classes.form}>
                {later && (
                  <>
                    <div className={classes.field}>
                      <DateInput title={t("crmSendDay")} defaultValue={day || undefined} onChange={(d) => setDay(d)} />
                    </div>
                    <label className={classes.field}>
                      {t("crmSendHour")}
                      <select value={hour} onChange={(e) => setHour(Number(e.target.value))}>
                        {HOURS.slice(0, -1).map((h) => (
                          <option key={h} value={h}>
                            {hourLabel(h)}
                          </option>
                        ))}
                      </select>
                    </label>
                  </>
                )}
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
              <p className={classes.muted}>{t("crmWindowHint")}</p>
            </section>
          </div>
          <aside className={crm.estimate}>
            <span className={classes.cardTitle}>{t("crmEstimate")}</span>
            <div className={crm.phone}>
              <pre className={crm.bubble} dir="auto">
                {estimate?.preview || t("crmPreviewEmpty")}
              </pre>
            </div>
            {!!estimate && (
              <dl className={crm.figures}>
                <dt>{t("crmRecipients")}</dt>
                <dd>{f.money(estimate.recipients)}</dd>
                <dt>{t("crmTotalParts")}</dt>
                <dd>{f.money(estimate.totalParts)}</dd>
                <dt>{t("crmFromQuota")}</dt>
                <dd>
                  {f.money(estimate.fromQuota)} / {f.money(estimate.quotaLeft)}
                </dd>
                <dt>{t("crmFromWallet", [f.money(estimate.unitPrice)])}</dt>
                <dd>
                  {f.money(estimate.cost)} {t("toman")}
                </dd>
              </dl>
            )}
            {!!estimate?.sample?.length && <p className={classes.muted}>{t("crmSampleRecipients", [estimate.sample.join("، ")])}</p>}
            {!!estimate && !estimate.affordable && <p className={crm.reject}>{t("crmNotAffordable", [f.money(estimate.balance)])}</p>}
            <p className={classes.muted}>{t("crmApprovalHint")}</p>
          </aside>
        </div>
        <div className={classes.actions}>
          <button type="button" className={classes.ghost} onClick={close}>
            {t("bizCancel")}
          </button>
          <button type="button" className={classes.ghost} disabled={busy || !valid} onClick={() => save(false)}>
            {t("crmSaveDraft")}
          </button>
          {canSend && (
            <button
              type="button"
              className={classes.primary}
              disabled={busy || !valid || !estimate?.recipients || !estimate.affordable}
              onClick={() => save(true)}
            >
              {t("crmSubmit")}
            </button>
          )}
        </div>
      </div>
    </PopupCard>
  );
};

const CrmCampaigns = () => {
  const t = useCrmText();
  const f = useBizFormat();
  const ctx = useCrm();
  const search = useSearchParams();
  const { setPopup } = usePopup();
  const pushNotification = useNotification();
  const { data, error, mutate } = useSWR<CrmCampaign[]>(`${API}${ctx.api}/campaigns`, (url: string) =>
    fetcher({ url }).then((res) => asArray<CrmCampaign>(res.data)),
  );
  const open = (c?: CrmCampaign, initial?: { segment?: string; contactIds?: string[] }) =>
    setPopup(
      POPUP,
      <CrmContext.Provider value={ctx}>
        <CampaignForm campaign={c} initial={initial} onDone={() => mutate()} />
      </CrmContext.Provider>,
    );
  // opened from a segment or a selection of contacts
  const opened = useRef(false);
  useEffect(() => {
    if (opened.current || !ctx.canWrite) return;
    const segment = search?.get("segment") || "";
    const contactIds = (search?.get("contacts") || "").split(",").filter((x) => /^[0-9a-f]{24}$/.test(x));
    if (segment || contactIds.length) {
      opened.current = true;
      open(undefined, { segment, contactIds });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, ctx.canWrite]);
  const cancel = async (c: CrmCampaign) => {
    try {
      await fetcher({ url: `${API}${ctx.api}/campaigns/${c._id}/cancel`, method: "POST" });
      pushNotification(t("crmCancelled"), "Success");
      mutate();
    } catch (err) {
      pushNotification(errText(err), "Error");
    }
  };
  const rows = asArray<CrmCampaign>(data);
  return (
    <section className={classes.card}>
      <div className={classes.cardHead}>
        <span className={classes.cardTitle}>{t("crmNavCampaigns")}</span>
        {ctx.canWrite && (
          <button type="button" className={classes.primary} onClick={() => open()}>
            {t("crmNewCampaign")}
          </button>
        )}
      </div>
      <p className={classes.muted}>{t("crmCampaignsHint")}</p>
      <HandleLoading data={!!data} error={error}>
        {!!data &&
          (rows.length === 0 ? (
            <p className={classes.empty}>{t("crmNoCampaigns")}</p>
          ) : (
            <div className={classes.tableWrap}>
              <table className={classes.table}>
                <thead>
                  <tr>
                    <th>{t("crmCampaignName")}</th>
                    <th>{t("status")}</th>
                    <th className={classes.num}>{t("crmRecipients")}</th>
                    <th className={classes.num}>{t("crmSentFailed")}</th>
                    <th className={classes.num}>{t("crmClicked")}</th>
                    <th className={classes.num}>{t("crmBooked")}</th>
                    <th className={classes.num}>{t("crmCharged")}</th>
                    <th>{t("bizDate")}</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {rows.map((c) => {
                    const editable = ctx.canWrite && (c.status === "Draft" || c.status === "Rejected");
                    const cancellable = ctx.canWrite && ["Draft", "Pending", "Rejected", "Approved"].includes(c.status);
                    const done = c.status === "Sent" || c.status === "Sending";
                    return (
                      <tr key={c._id}>
                        <td className={classes.wrap}>
                          <Link href={`${ctx.panel}/crm/campaigns/${c._id}`} className={crm.linkButton}>
                            {c.name}
                          </Link>
                          {c.status === "Rejected" && c.rejectReason ? <span className={crm.rejectInline}> · {c.rejectReason}</span> : null}
                        </td>
                        <td>
                          <span className={`${classes.badge} ${campaignTone(c.status)}`}>{t(statusKey[c.status] || "crmStDraft")}</span>
                        </td>
                        <td className={classes.num}>{f.money(c.recipients)}</td>
                        <td className={classes.num}>{done ? `${f.money(c.sentCount)} / ${f.money(c.failedCount)}` : "—"}</td>
                        <td className={classes.num}>{done ? f.money(c.clicks) : "—"}</td>
                        <td className={classes.num}>{done ? f.money(c.bookings) : "—"}</td>
                        <td className={classes.num}>{c.status === "Sent" ? f.money(c.charged - c.refunded) : "—"}</td>
                        <td>{f.date(c.finishedAt || c.sendAfter || c.sendAt || c.submittedAt || c.createdAt)}</td>
                        <td>
                          <span className={crm.rowActions}>
                            {editable && (
                              <button type="button" className={crm.linkButton} onClick={() => open(c)}>
                                {t("bizEdit")}
                              </button>
                            )}
                            {cancellable && (
                              <button type="button" className={crm.linkDanger} onClick={() => cancel(c)}>
                                {t("crmCancel")}
                              </button>
                            )}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ))}
      </HandleLoading>
    </section>
  );
};

export default CrmCampaigns;
