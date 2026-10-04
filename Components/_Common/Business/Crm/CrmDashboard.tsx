"use client";

import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import Link from "@/Components/i18n/Link";
import classes from "../Accounting.module.css";
import crm from "./Crm.module.css";
import { asArray, useBizFormat } from "../bizShared";
import { CrmCampaign, phoneText, statusKey, useCrm, useCrmText, usePercent } from "./crmShared";

type Dashboard = {
  contacts: { total: number; newMonth: number; active: number; lapsed: number; optedOut: number };
  followUps: {
    overdue: number;
    upcoming: number;
    next: { _id: string; text: string; dueAt: string; contact?: { _id: string; name?: string; phone: string } | null }[];
  };
  recallsWeek: number;
  birthdays: { _id: string; name?: string; phone: string; birthMD?: number; smsOptOut?: boolean }[];
  campaigns: CrmCampaign[];
  messages30: { _id: "campaign" | "automation" | "single"; sent: number; failed: number; clicked: number; booked: number; parts: number }[];
  noShow: { done: number; missed: number; rate: number; tracked: boolean };
  sms: { quota: number; quotaUsed: number; balance: number; unitPrice: number };
  automationsOn: number;
};

// The section's home (2026-10): who the patients are (new this month,
// active vs lapsed), what is due (follow-ups, the automations' messages of
// the coming week, birthdays), how the messages did (campaigns and
// automations: sent, clicked, booked), the no-show rate and the SMS credit.
const CrmDashboard = () => {
  const t = useCrmText();
  const f = useBizFormat();
  const { api, panel } = useCrm();
  const base = `${panel}/crm`;
  const { data, error } = useSWR<Dashboard>(`${API}${api}/dashboard`, (url: string) => fetcher({ url }).then((res) => res.data as Dashboard));
  const tile = (label: string, value: string, sub?: string, href?: string, tone = "") => {
    const inner = (
      <>
        <span className={classes.tileLabel}>{label}</span>
        <span className={classes.tileValue}>{value}</span>
        {!!sub && <span className={crm.tileSub}>{sub}</span>}
      </>
    );
    return href ? (
      <Link href={href} className={`${classes.tile} ${crm.tileLink} ${tone} ${tone === classes.primaryTile ? crm.onPrimary : ""}`}>
        {inner}
      </Link>
    ) : (
      <div className={`${classes.tile} ${tone}`}>{inner}</div>
    );
  };
  const msg = (k: "campaign" | "automation") => asArray<Dashboard["messages30"][number]>(data?.messages30).find((m) => m._id === k);
  const auto = msg("automation");
  const camp = msg("campaign");
  const pct = usePercent();
  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <>
          <div className={classes.tiles}>
            {tile(t("crmTileContacts"), f.money(data.contacts.total), t("crmDashNewMonth", [f.money(data.contacts.newMonth)]), `${base}/contacts`, classes.primaryTile)}
            {tile(
              t("crmDashActive"),
              f.money(data.contacts.active),
              t("crmDashLapsed", [f.money(data.contacts.lapsed)]),
              `${base}/contacts?segment=preset:lapsed`,
            )}
            {tile(
              t("crmDashFollowUps"),
              f.money(data.followUps.upcoming),
              data.followUps.overdue ? t("crmDashOverdue", [f.money(data.followUps.overdue)]) : t("crmDashNext7"),
              `${base}/followups`,
              data.followUps.overdue ? crm.tileWarn : "",
            )}
            {tile(t("crmDashRecalls"), f.money(data.recallsWeek), t("crmDashAutomationsOn", [f.money(data.automationsOn)]), `${base}/automations`)}
            {tile(
              t("crmDashNoShow"),
              data.noShow.tracked ? pct(data.noShow.missed, data.noShow.done + data.noShow.missed) : "—",
              data.noShow.tracked ? t("crmDashNoShowSub", [f.money(data.noShow.missed), f.money(data.noShow.done + data.noShow.missed)]) : t("crmDashNoVisits"),
            )}
            {tile(
              t("crmTileQuota"),
              `${f.money(Math.max(0, data.sms.quota - data.sms.quotaUsed))} / ${f.money(data.sms.quota)}`,
              t("crmDashWallet", [f.money(data.sms.balance)]),
            )}
          </div>

          <div className={crm.dashGrid}>
            <section className={classes.card}>
              <div className={classes.cardHead}>
                <span className={classes.cardTitle}>{t("crmDashPerformance")}</span>
                <Link href={`${base}/campaigns`} className={crm.linkButton}>
                  {t("crmNavCampaigns")}
                </Link>
              </div>
              <div className={crm.perfRow}>
                {[
                  { k: "crmDashCampaigns30", m: camp },
                  { k: "crmDashAutomations30", m: auto },
                ].map(({ k, m }) => (
                  <div key={k} className={crm.perfBox}>
                    <span className={classes.tileLabel}>{t(k)}</span>
                    <dl className={crm.figures}>
                      <dt>{t("crmSent")}</dt>
                      <dd>{f.money(m?.sent)}</dd>
                      <dt>{t("crmClicked")}</dt>
                      <dd>
                        {f.money(m?.clicked)} {!!m?.sent && <span className={classes.muted}>({pct(m.clicked, m.sent)})</span>}
                      </dd>
                      <dt>{t("crmBooked")}</dt>
                      <dd>
                        {f.money(m?.booked)} {!!m?.sent && <span className={classes.muted}>({pct(m.booked, m.sent)})</span>}
                      </dd>
                    </dl>
                  </div>
                ))}
              </div>
              {asArray<CrmCampaign>(data.campaigns).length > 0 && (
                <div className={classes.tableWrap}>
                  <table className={classes.table}>
                    <thead>
                      <tr>
                        <th>{t("crmCampaignName")}</th>
                        <th>{t("status")}</th>
                        <th className={classes.num}>{t("crmSent")}</th>
                        <th className={classes.num}>{t("crmClicked")}</th>
                        <th className={classes.num}>{t("crmBooked")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {asArray<CrmCampaign>(data.campaigns).map((c) => (
                        <tr key={c._id}>
                          <td className={classes.wrap}>
                            <Link href={`${base}/campaigns/${c._id}`} className={crm.linkButton}>
                              {c.name}
                            </Link>
                          </td>
                          <td>
                            <span className={classes.badge}>{t(statusKey[c.status] || "crmStDraft")}</span>
                          </td>
                          <td className={classes.num}>{f.money(c.sentCount)}</td>
                          <td className={classes.num}>{f.money(c.clicks)}</td>
                          <td className={classes.num}>{f.money(c.bookings)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            <section className={classes.card}>
              <div className={classes.cardHead}>
                <span className={classes.cardTitle}>{t("crmDashNextFollowUps")}</span>
                <Link href={`${base}/followups`} className={crm.linkButton}>
                  {t("crmNavFollowUps")}
                </Link>
              </div>
              {data.followUps.next.length === 0 ? (
                <p className={classes.empty}>{t("crmNoFollowUps")}</p>
              ) : (
                <ul className={crm.miniList}>
                  {data.followUps.next.map((r) => (
                    <li key={r._id} className={new Date(r.dueAt).getTime() < Date.now() ? crm.overdue : ""}>
                      <Link href={r.contact ? `${base}/contacts/${r.contact._id}` : `${base}/followups`} className={crm.miniMain}>
                        <span className={crm.fuText}>{r.text}</span>
                        <span className={classes.muted}>{r.contact?.name || phoneText(r.contact?.phone || "")}</span>
                      </Link>
                      <span className={classes.badge}>{f.date(r.dueAt)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className={classes.card}>
              <div className={classes.cardHead}>
                <span className={classes.cardTitle}>{t("crmDashBirthdays")}</span>
                <Link href={`${base}/automations`} className={crm.linkButton}>
                  {t("crmAutoBirthday")}
                </Link>
              </div>
              {data.birthdays.length === 0 ? (
                <p className={classes.empty}>{t("crmDashNoBirthdays")}</p>
              ) : (
                <ul className={crm.miniList}>
                  {data.birthdays.map((c) => (
                    <li key={c._id}>
                      <Link href={`${base}/contacts/${c._id}`} className={crm.miniMain}>
                        <span className={crm.fuText}>{c.name || phoneText(c.phone)}</span>
                        <bdi dir="ltr" className={classes.muted}>
                          {phoneText(c.phone)}
                        </bdi>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </>
      )}
    </HandleLoading>
  );
};

export default CrmDashboard;
