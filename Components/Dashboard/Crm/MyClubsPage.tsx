"use client";

import { useCallback } from "react";
import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import useNotification from "@/Components/Hooks/useNotification";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import useBreadCrump from "@/Components/Hooks/useBreadCrump";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import { ContentKey } from "@/Components/Enums/contentKeys";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import classes from "@/Components/_Common/Business/Accounting.module.css";
import s from "@/Components/_Common/Business/Crm/Service/Service.module.css";
import { asArray, useBizFormat } from "@/Components/_Common/Business/bizShared";
import { LinkOffers } from "./LinkOffers";
import { basisOfClub, tierKey, TierKey, TierBasis, redemptionStatusKey } from "@/Components/_Common/Business/Crm/Service/CrmClub";
import { isProfile, profileKey } from "@/Components/_Common/Business/Crm/Service/profiles";

// «باشگاه‌های من» (2026-10): the patient's points in every centre whose
// loyalty club they are in (they visited or bought there) - tier, progress,
// the rewards they can take and their codes to show at the desk
// (Controllers/userCrmController.ts).

export const MY_CRM_NS: ContentNamespace[] = ["common", "bizCrm"];

type Club = {
  ownerKind: string;
  ownerId: string;
  name: string;
  pointUnit?: number;
  perVisit?: number;
  tierBasis?: TierBasis;
  // count: attended visits + delivered orders; toNext: what is left to the
  // next tier, in the club's basis (toman or visits / orders)
  member: { balance: number; earned: number; total: number; count?: number; basis?: TierBasis; toNext?: number; tier: TierKey; next: TierKey | null; progress: number; discount: number };
  rewards: { _id: string; name: string; description?: string; points: number; kind: string; value: number; maxDiscount: number }[];
  codes: { _id: string; name: string; kind: string; code: string; status: "issued" | "applied" | "used"; expiresAt?: string; discountAmount: number }[];
};

const MyClubsPage = () => {
  const getContent = useScopedLocale(MY_CRM_NS);
  const t = useCallback((k: string, v?: string[]) => getContent(k as ContentKey, v), [getContent]);
  const f = useBizFormat();
  const push = useNotification();
  useBreadCrump([
    { title: t("dashboard"), target: "/dashboard" },
    { title: t("crmeMyClubs"), target: "/dashboard/club" },
  ]);
  const { data, error, mutate } = useSWR<Club[]>(`${API}/user/crm/clubs`, (url: string) => fetcher({ url }).then((r) => asArray<Club>(r?.data)));
  const post = async (url: string, payload?: Record<string, unknown>) => {
    try {
      await fetcher({ url: `${API}${url}`, method: "POST", bodyParser: "JSON", ...(payload ? { payload } : {}) });
      push(t("bizSaved"), "Success");
      mutate();
    } catch (err) {
      push((err as Error)?.message || String(err), "Error");
    }
  };
  // how this centre's club gives points: per visit / order (in the
  // profile's words) and per amount paid
  const earnText = (c: Club) =>
    [
      c.perVisit ? t(profileKey(isProfile(c.ownerKind) ? c.ownerKind : undefined, "crmeEarnByVisit"), [f.money(c.perVisit)]) : "",
      c.pointUnit ? t("crmeEarnByAmount", [f.money(c.pointUnit)]) : "",
    ]
      .filter(Boolean)
      .join(" · ");
  // a club row missing its parts is skipped, not a crash
  const clubs = asArray<Club>(data)
    .filter((c) => c && c.member)
    .map((c) => ({ ...c, codes: asArray<Club["codes"][number]>(c.codes), rewards: asArray<Club["rewards"][number]>(c.rewards) }));
  const rewardText = (r: { kind: string; value: number; maxDiscount?: number }) =>
    r.kind === "amount" ? t("crmeRewardAmount", [f.money(r.value)]) : r.maxDiscount ? t("crmeRewardPercentCap", [f.money(r.value), f.money(r.maxDiscount)]) : t("crmeRewardPercent", [f.money(r.value)]);
  return (
    <div className={classes.main}>
      <header className={classes.header}>
        <h1 className={classes.title}>{t("crmeMyClubs")}</h1>
        <span className={classes.subtitle}>{t("crmeMyClubsHint")}</span>
      </header>
      {/* centres that added the patient themselves: linked only on «وصل شود» */}
      <LinkOffers onChanged={() => mutate()} />
      <HandleLoading data={!!data} error={error}>
        {!!data &&
          (!clubs.length ? (
            <p className={classes.empty}>{t("crmeNoClubs")}</p>
          ) : (
            clubs.map((c) => (
              <section key={`${c.ownerKind}:${c.ownerId}`} className={classes.card}>
                <div className={classes.cardHead}>
                  <h2 className={classes.cardTitle}>{c.name}</h2>
                  <span className={classes.badge}>{t(tierKey[c.member.tier] || tierKey.basic)}</span>
                </div>
                {!!earnText(c) && <p className={s.hint}>{t("crmeHowToEarn", [earnText(c)])}</p>}
                <div className={s.tiers}>
                  <div className={s.tier}>
                    <span className={classes.muted}>{t("crmePointsBalance")}</span>
                    <span className={s.tierName}>{f.money(c.member.balance)}</span>
                  </div>
                  <div className={s.tier}>
                    <span className={classes.muted}>{t("crmeTier")}</span>
                    <span className={s.tierName}>{t(tierKey[c.member.tier] || tierKey.basic)}</span>
                    {c.member.discount > 0 && <span className={classes.muted}>{t("crmeTierDiscountN", [f.money(c.member.discount)])}</span>}
                  </div>
                  {c.member.next && (
                    <div className={s.tier}>
                      <span className={classes.muted}>{t("crmeToNext", [t(tierKey[c.member.next])])}</span>
                      {/* a club ranked by visits / orders says how many are left, in the profile's words */}
                      {basisOfClub({ tierBasis: c.member.basis || c.tierBasis }) === "visits" && (
                        <span className={s.strong}>{t(profileKey(isProfile(c.ownerKind) ? c.ownerKind : undefined, "crmeToNextVisits"), [f.money(Math.max(0, Number(c.member.toNext) || 0))])}</span>
                      )}
                      <span className={s.progress}>
                        <span style={{ width: `${c.member.progress}%` }} />
                      </span>
                    </div>
                  )}
                </div>
                {c.codes.length > 0 && (
                  <div className={s.stack}>
                    <span className={s.strong}>{t("crmeMyCodes")}</span>
                    <p className={s.hint}>{t("crmeShowCodeHint")}</p>
                    {c.codes.map((x) => (
                      <div key={x._id} className={s.between}>
                        <span className={s.row}>
                          <span className={s.code}>{x.code}</span>
                          <span>{x.kind === "tier" ? t("crmeTierCodeName", [t(tierKey[x.name as TierKey] || x.name)]) : x.name}</span>
                          <span className={classes.badge}>{t(redemptionStatusKey[x.status] || "crmeRedIssued")}</span>
                          {x.status === "issued" && x.expiresAt && <span className={classes.muted}>{t("crmeUntil", [f.date(x.expiresAt)])}</span>}
                        </span>
                        {x.status === "issued" && (
                          <button type="button" className={classes.ghost} onClick={() => post(`/user/crm/clubs/${c.ownerKind}/${c.ownerId}/codes/${x._id}/cancel`)}>
                            {t("crmCancel")}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                <div className={s.stack}>
                  <span className={s.strong}>{t("crmeRewards")}</span>
                  {!c.rewards.length ? (
                    <p className={classes.empty}>{t("crmeNoRewards")}</p>
                  ) : (
                    c.rewards.map((r) => (
                      <div key={r._id} className={s.between}>
                        <span className={s.stack}>
                          <span className={s.strong}>{r.name}</span>
                          <span className={classes.muted}>
                            {t("crmePointsN", [f.money(r.points)])} · {rewardText(r)}
                          </span>
                          {r.description && <span className={s.hint}>{r.description}</span>}
                        </span>
                        <button
                          type="button"
                          className={classes.primary}
                          disabled={r.points > c.member.balance}
                          onClick={() => post(`/user/crm/clubs/${c.ownerKind}/${c.ownerId}/redeem`, { reward: r._id })}
                        >
                          {t("crmeRedeem")}
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </section>
            ))
          ))}
      </HandleLoading>
    </div>
  );
};

export default MyClubsPage;
