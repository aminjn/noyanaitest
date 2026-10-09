"use client";

import { useState } from "react";
import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import Link from "@/Components/i18n/Link";
import classes from "../Accounting.module.css";
import crm from "./Crm.module.css";
import { asArray, useBizFormat } from "../bizShared";
import { CrmCampaign, phoneText, statusKey, useCrm, useCrmText, usePercent } from "./crmShared";
import { useRulesSummary } from "./CrmRulesForm";
import { campaignTone } from "./CrmCampaigns";

type Msg = {
  _id: string;
  contact?: { _id: string; name?: string } | null;
  phone: string;
  status: "queued" | "sent" | "failed" | "skipped";
  reason?: string;
  parts: number;
  clicks: number;
  clickedAt?: string;
  bookedAt?: string;
  sentAt?: string;
};
type Detail = {
  campaign: CrmCampaign;
  preview: string;
  stats: { sent: number; failed: number; clicked: number; booked: number; optedOut?: number };
  messages: Msg[];
  total: number;
  page: number;
  pages: number;
};
const FILTERS = ["", "sent", "failed", "clicked", "booked"] as const;
const filterKey: Record<(typeof FILTERS)[number], string> = {
  "": "crmSegAll",
  sent: "crmSent",
  failed: "crmMsgFailed",
  clicked: "crmClicked",
  booked: "crmBooked",
};

// One campaign's results (2026-10): the funnel (handed to the gateway,
// clicked the tracked link, booked within 14 days, opted out after it), the
// net cost, and each recipient's own message status.
const CrmCampaignDetail = ({ id }: { id: string }) => {
  const t = useCrmText();
  const f = useBizFormat();
  const pct = usePercent();
  const { api, panel } = useCrm();
  const summary = useRulesSummary();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<(typeof FILTERS)[number]>("");
  const { data, error } = useSWR<Detail>(
    `${API}${api}/campaigns/${id}?page=${page}${status ? `&status=${status}` : ""}`,
    (url: string) => fetcher({ url }).then((res) => res.data as Detail),
    { keepPreviousData: true },
  );
  const c = data?.campaign;
  const s = data?.stats;
  return (
    <HandleLoading data={!!data} error={error}>
      {!!c && !!s && (
        <>
          <section className={classes.card}>
            <div className={classes.cardHead}>
              <span className={classes.cardTitle}>{c.name}</span>
              <span className={`${classes.badge} ${campaignTone(c.status)}`}>{t(statusKey[c.status] || "crmStDraft")}</span>
            </div>
            <div className={classes.tiles}>
              <div className={classes.tile}>
                <span className={classes.tileLabel}>{t("crmRecipients")}</span>
                <span className={classes.tileValue}>{f.money(c.recipients)}</span>
              </div>
              <div className={classes.tile}>
                <span className={classes.tileLabel}>{t("crmSent")}</span>
                <span className={classes.tileValue}>{f.money(s.sent)}</span>
                <span className={crm.tileSub}>{t("crmFailedN", [f.money(s.failed)])}</span>
              </div>
              <div className={classes.tile}>
                <span className={classes.tileLabel}>{t("crmClicked")}</span>
                <span className={classes.tileValue}>{f.money(s.clicked)}</span>
                <span className={crm.tileSub}>{pct(s.clicked, s.sent)}</span>
              </div>
              <div className={classes.tile}>
                <span className={classes.tileLabel}>{t("crmBooked")}</span>
                <span className={classes.tileValue}>{f.money(s.booked)}</span>
                <span className={crm.tileSub}>{pct(s.booked, s.sent)}</span>
              </div>
              <div className={classes.tile}>
                <span className={classes.tileLabel}>{t("crmOptedOutAfter")}</span>
                <span className={classes.tileValue}>{f.money(s.optedOut || 0)}</span>
                <span className={crm.tileSub}>{pct(s.optedOut || 0, s.sent)}</span>
              </div>
              <div className={classes.tile}>
                <span className={classes.tileLabel}>{t("crmCharged")}</span>
                <span className={classes.tileValue}>{f.money(c.charged - c.refunded)}</span>
                <span className={crm.tileSub}>{t("crmQuotaParts", [f.money(c.fromQuota)])}</span>
              </div>
            </div>
            <div className={crm.campaignGrid}>
              <dl className={crm.figures}>
                <dt>{t("crmAudience")}</dt>
                <dd>
                  {c.audience?.contactIds?.length
                    ? t("crmSelectionN", [f.money(c.audience.contactIds.length)])
                    : summary(c.audience).join(" · ") || t("crmRuleCountAll")}
                </dd>
                <dt>{t("crmSendAfter")}</dt>
                <dd>{f.date(c.sendAfter || c.sendAt)}</dd>
                <dt>{t("crmFinishedAt")}</dt>
                <dd>{f.date(c.finishedAt)}</dd>
              </dl>
              <div className={crm.phone}>
                <pre className={crm.bubble} dir="auto">
                  {data.preview}
                </pre>
              </div>
            </div>
            {c.simulated && <p className={crm.reject}>{t("crmSimulatedNote")}</p>}
            <p className={classes.muted}>{t("crmAttributionHint")}</p>
          </section>

          <section className={classes.card}>
            <div className={classes.cardHead}>
              <span className={classes.cardTitle}>{t("crmRecipientsList")}</span>
              <div className={crm.scrollRow}>
                <div className={classes.segmented} role="tablist">
                  {FILTERS.map((k) => (
                    <button
                      key={k || "all"}
                      type="button"
                      role="tab"
                      aria-selected={status === k}
                      className={status === k ? classes.on : ""}
                      onClick={() => {
                        setStatus(k);
                        setPage(1);
                      }}
                    >
                      {t(filterKey[k])}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            {asArray<Msg>(data.messages).length === 0 ? (
              <p className={classes.empty}>{t("bizEmpty")}</p>
            ) : (
              <div className={classes.tableWrap}>
                <table className={classes.table}>
                  <thead>
                    <tr>
                      <th>{t("crmName")}</th>
                      <th>{t("crmPhone")}</th>
                      <th>{t("status")}</th>
                      <th className={classes.num}>{t("crmClicked")}</th>
                      <th>{t("crmBooked")}</th>
                      <th>{t("bizDate")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {asArray<Msg>(data.messages).map((m) => (
                      <tr key={m._id}>
                        <td className={classes.wrap}>
                          {m.contact ? (
                            <Link href={`${panel}/crm/contacts/${m.contact._id}`} className={crm.linkButton}>
                              {m.contact.name || "—"}
                            </Link>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td dir="ltr" className={crm.start}>
                          {phoneText(m.phone)}
                        </td>
                        <td>
                          <span className={`${classes.badge} ${m.status === "sent" ? crm.badgeOk : m.status === "failed" ? crm.badgeBad : crm.badgeMuted}`}>
                            {t(m.status === "sent" ? "crmMsgSent" : m.status === "failed" ? "crmMsgFailed" : "crmMsgQueued")}
                          </span>
                        </td>
                        <td className={classes.num}>{m.clicks ? f.money(m.clicks) : "—"}</td>
                        <td>{m.bookedAt ? f.date(m.bookedAt) : "—"}</td>
                        <td>{f.date(m.sentAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {data.pages > 1 && (
              <div className={classes.pagination}>
                <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                  {t("bizPrev")}
                </button>
                <span>{t("bizPage", [f.money(page), f.money(data.pages)])}</span>
                <button type="button" disabled={page >= data.pages} onClick={() => setPage((p) => p + 1)}>
                  {t("bizNext")}
                </button>
              </div>
            )}
          </section>
        </>
      )}
    </HandleLoading>
  );
};

export default CrmCampaignDetail;
