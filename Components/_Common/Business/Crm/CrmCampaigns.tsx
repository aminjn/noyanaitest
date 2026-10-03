"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import useNotification from "@/Components/Hooks/useNotification";
import usePopup from "@/Components/Hooks/usePopup";
import PopupCard from "@/Components/UI/PopupCard";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import classes from "../Accounting.module.css";
import crm from "./Crm.module.css";
import { asArray, useBizFormat } from "../bizShared";
import {
  CrmAudience,
  CrmCampaign,
  CrmContext,
  CrmEstimate,
  statusKey,
  useCrm,
  useCrmTags,
  useCrmText,
} from "./crmShared";

const POPUP = "CrmCampaign";
const num = (s: string) => Math.max(0, Math.round(Number(String(s).replace(/[^\d]/g, "")) || 0));

const statusTone = (s: CrmCampaign["status"]) =>
  s === "Sent" || s === "Approved" ? crm.badgeOk : s === "Rejected" ? crm.badgeBad : s === "Pending" ? crm.badgeWarn : "";

// The campaign form: the audience (only the owner's own patients and
// customers who have not opted out), the text with its SMS parts, and a
// live estimate of who it reaches and what it costs - the plan's quota
// first, then the wallet. Saved as a draft; "send for approval" puts it in
// the super admin's queue.
const CampaignForm = ({ campaign, onDone }: { campaign?: CrmCampaign; onDone: () => unknown }) => {
  const t = useCrmText();
  const f = useBizFormat();
  const { api, canSend } = useCrm();
  const popup = usePopup();
  const close = () => popup.closePopup(POPUP);
  const pushNotification = useNotification();
  const { data: allTags } = useCrmTags();
  const [name, setName] = useState(campaign?.name || "");
  const [text, setText] = useState(campaign?.text || "");
  const [tags, setTags] = useState<string[]>(campaign?.audience.tags || []);
  const [sources, setSources] = useState<string[]>(campaign?.audience.sources || []);
  const [gender, setGender] = useState<string>(campaign?.audience.gender || "");
  const [inactiveDays, setInactiveDays] = useState(campaign?.audience.inactiveDays ? String(campaign.audience.inactiveDays) : "");
  const [activeDays, setActiveDays] = useState(campaign?.audience.activeDays ? String(campaign.audience.activeDays) : "");
  const [minVisits, setMinVisits] = useState(campaign?.audience.minVisits ? String(campaign.audience.minVisits) : "");
  const [estimate, setEstimate] = useState<CrmEstimate | null>(null);
  const [busy, setBusy] = useState(false);
  const audience: CrmAudience = {
    tags,
    sources,
    gender: (gender || null) as CrmAudience["gender"],
    inactiveDays: inactiveDays ? num(inactiveDays) : null,
    activeDays: activeDays ? num(activeDays) : null,
    minVisits: minVisits ? num(minVisits) : null,
  };
  const key = JSON.stringify([text, audience]);
  useEffect(() => {
    const h = setTimeout(() => {
      fetcher({ url: `${API}${api}/campaigns/estimate`, method: "POST", payload: { text, audience: JSON.parse(key)[1] } })
        .then((res) => setEstimate(res.data as CrmEstimate))
        .catch(() => setEstimate(null));
    }, 400);
    return () => clearTimeout(h);
  }, [api, key, text]);
  const toggle = (list: string[], set: (v: string[]) => void, v: string) =>
    set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);
  const valid = name.trim().length >= 2 && text.trim().length >= 5;

  const save = async (submit: boolean) => {
    if (busy || !valid) return;
    setBusy(true);
    try {
      const res = await fetcher({
        url: campaign ? `${API}${api}/campaigns/${campaign._id}` : `${API}${api}/campaigns`,
        method: campaign ? "PATCH" : "POST",
        payload: { name: name.trim(), text: text.trim(), audience },
      });
      const id = (res.data as { _id?: string })?._id || campaign?._id;
      // the draft is kept either way; a refused submit leaves it to fix
      close();
      onDone();
      if (submit && id) {
        await fetcher({ url: `${API}${api}/campaigns/${id}/submit`, method: "POST" });
        pushNotification(t("crmSubmitted"), "Success");
        onDone();
      } else pushNotification(t("bizSaved"), "Success");
    } catch (err) {
      pushNotification((err as Error)?.message || String(err), "Error");
      setBusy(false);
    }
  };

  const chars = Array.from(text).length;
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
            <label className={classes.field}>
              {t("crmCampaignName")}
              <input value={name} onChange={(e) => setName(e.target.value)} maxLength={120} placeholder={t("crmCampaignNameHint")} />
            </label>
            <label className={classes.field}>
              {t("crmCampaignText")}
              <textarea className={crm.smsText} value={text} onChange={(e) => setText(e.target.value)} maxLength={700} dir="auto" />
              <span className={classes.muted}>
                {t("crmChars", [f.money(chars), f.money(estimate?.parts || 1)])}
              </span>
            </label>
            <p className={classes.muted}>{t("crmTextRules")}</p>
            <section className={crm.subCard}>
              <span className={classes.cardTitle}>{t("crmAudience")}</span>
              {asArray<string>(allTags).length > 0 && (
                <div className={crm.chips}>
                  {asArray<string>(allTags).map((x) => (
                    <button key={x} type="button" className={`${crm.chip} ${tags.includes(x) ? crm.chipOn : ""}`} onClick={() => toggle(tags, setTags, x)}>
                      {x}
                    </button>
                  ))}
                </div>
              )}
              <div className={crm.chips}>
                {(["visit", "order", "manual"] as const).map((s) => (
                  <button key={s} type="button" className={`${crm.chip} ${sources.includes(s) ? crm.chipOn : ""}`} onClick={() => toggle(sources, setSources, s)}>
                    {t(s === "visit" ? "crmSourceVisit" : s === "order" ? "crmSourceOrder" : "crmSourceManual")}
                  </button>
                ))}
              </div>
              <div className={classes.form}>
                <label className={classes.field}>
                  {t("crmGender")}
                  <select value={gender} onChange={(e) => setGender(e.target.value)}>
                    <option value="">{t("crmAny")}</option>
                    <option value="female">{t("crmFemale")}</option>
                    <option value="male">{t("crmMale")}</option>
                  </select>
                </label>
                <label className={classes.field}>
                  {t("crmInactiveDays")}
                  <input value={inactiveDays} onChange={(e) => setInactiveDays(e.target.value)} inputMode="numeric" />
                </label>
                <label className={classes.field}>
                  {t("crmActiveDays")}
                  <input value={activeDays} onChange={(e) => setActiveDays(e.target.value)} inputMode="numeric" />
                </label>
                <label className={classes.field}>
                  {t("crmMinVisits")}
                  <input value={minVisits} onChange={(e) => setMinVisits(e.target.value)} inputMode="numeric" />
                </label>
              </div>
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

const CrmCampaigns = ({ refreshKey, onChanged }: { refreshKey: number; onChanged: () => unknown }) => {
  const t = useCrmText();
  const f = useBizFormat();
  const ctx = useCrm();
  const { setPopup } = usePopup();
  const pushNotification = useNotification();
  const { data, error, mutate } = useSWR<CrmCampaign[]>(`${API}${ctx.api}/campaigns`, (url: string) =>
    fetcher({ url }).then((res) => asArray<CrmCampaign>(res.data)),
  );
  useEffect(() => {
    mutate();
  }, [refreshKey, mutate]);
  const changed = () => {
    mutate();
    onChanged();
  };
  const open = (c?: CrmCampaign) =>
    setPopup(
      POPUP,
      <CrmContext.Provider value={ctx}>
        <CampaignForm campaign={c} onDone={changed} />
      </CrmContext.Provider>,
    );
  const cancel = async (c: CrmCampaign) => {
    try {
      await fetcher({ url: `${API}${ctx.api}/campaigns/${c._id}/cancel`, method: "POST" });
      pushNotification(t("crmCancelled"), "Success");
      changed();
    } catch (err) {
      pushNotification((err as Error)?.message || String(err), "Error");
    }
  };
  const rows = asArray<CrmCampaign>(data);
  return (
    <section className={classes.card}>
      <div className={classes.cardHead}>
        <span className={classes.cardTitle}>{t("crmTabCampaigns")}</span>
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
                    <th className={classes.num}>{t("crmCharged")}</th>
                    <th>{t("bizDate")}</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {rows.map((c) => {
                    const editable = ctx.canWrite && (c.status === "Draft" || c.status === "Rejected");
                    const cancellable = ctx.canWrite && ["Draft", "Pending", "Rejected", "Approved"].includes(c.status);
                    return (
                      <tr key={c._id}>
                        <td className={classes.wrap}>
                          {c.name}
                          {c.status === "Rejected" && c.rejectReason ? <span className={crm.rejectInline}> · {c.rejectReason}</span> : null}
                        </td>
                        <td>
                          <span className={`${classes.badge} ${statusTone(c.status)}`}>{t(statusKey[c.status] || "crmStDraft")}</span>
                        </td>
                        <td className={classes.num}>{f.money(c.recipients)}</td>
                        <td className={classes.num}>{c.status === "Sent" ? `${f.money(c.sentCount)} / ${f.money(c.failedCount)}` : "—"}</td>
                        <td className={classes.num}>{c.status === "Sent" ? f.money(c.charged - c.refunded) : "—"}</td>
                        <td>{f.date(c.finishedAt || c.submittedAt || c.createdAt)}</td>
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
