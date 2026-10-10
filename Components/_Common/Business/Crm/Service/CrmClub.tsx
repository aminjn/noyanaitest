"use client";

import { useEffect, useState } from "react";
import usePopup from "@/Components/Hooks/usePopup";
import PopupCard from "@/Components/UI/PopupCard";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import Table from "@/Components/Admin/UI/Table";
import TableActions from "@/Components/Admin/UI/TableActions";
import IconButton from "@/Components/Admin/UI/IconButton";
import CreateForm from "@/Components/Admin/UI/CreateForm";
import EditIcon from "@/Components/Icons/EditIcon";
import GarbageIcon from "@/Components/Icons/GarbageIcon";
import EyeIcon from "@/Components/Icons/EyeIcon";
import { API } from "@/Components/config";
import classes from "../../Accounting.module.css";
import crm from "../Crm.module.css";
import s from "./Service.module.css";
import { useBizFormat } from "../../bizShared";
import { CrmContext, phoneText } from "../crmShared";
import { Badge, ConfirmButton, listOf, useCall, useCrm, useCrmText, useGet, useWhen } from "./svc";

// «باشگاه بیماران» (2026-10), nexxacrm's crm/club made to mean something at
// the desk: the club's switch, point value and tiers; the rewards patients
// buy with points; the members with their points and tier; and the codes
// taken, applied to a draft invoice as a real discount
// (Lib/business/crmService/club.ts).

export const TIERS = ["platinum", "gold", "silver", "bronze", "basic"] as const;
export type TierKey = (typeof TIERS)[number];
export const tierKey: Record<TierKey, string> = {
  platinum: "crmeTierPlatinum",
  gold: "crmeTierGold",
  silver: "crmeTierSilver",
  bronze: "crmeTierBronze",
  basic: "crmeTierBasic",
};
type Tier = { key: TierKey; min: number; discount: number };
// what the tiers count: the total paid (toman), or attended visits /
// delivered orders (backend Models/BizClubSettings.ts tierBasis)
export type TierBasis = "amount" | "visits";
type Settings = { enabled: boolean; pointUnit: number; perVisit?: number; codeDays: number; tierBasis?: TierBasis; tiers: Tier[] };
// the thresholds a basis starts from (backend defaultClubTiers / defaultVisitTiers)
const DEFAULT_MIN: Record<TierBasis, Record<TierKey, number>> = {
  amount: { platinum: 100_000_000, gold: 50_000_000, silver: 20_000_000, bronze: 5_000_000, basic: 0 },
  visits: { platinum: 50, gold: 25, silver: 10, bronze: 3, basic: 0 },
};
export const basisOfClub = (v: { tierBasis?: string } | null | undefined): TierBasis => (v?.tierBasis === "visits" ? "visits" : "amount");
export type Reward = { _id: string; name: string; description?: string; points: number; kind: "percent" | "amount"; value: number; maxDiscount: number; active: boolean };
type Member = {
  contact: string;
  name?: string;
  phone?: string;
  total: number;
  earned: number;
  adjusted: number;
  held: number;
  balance: number;
  tier: TierKey;
  next: TierKey | null;
  progress: number;
  discount: number;
  // attended visits + delivered orders, what the tier reads, what is left
  count?: number;
  basis?: TierBasis;
  toNext?: number;
};
type RedemptionStatus = "issued" | "applied" | "used" | "cancelled" | "expired";
type Redemption = {
  _id: string;
  code: string;
  name: string;
  kind: "percent" | "amount" | "tier";
  value: number;
  maxDiscount: number;
  points: number;
  status: RedemptionStatus;
  discountAmount: number;
  expiresAt?: string;
  byPatient?: boolean;
  createdAt: string;
  contact?: { _id: string; name?: string; phone: string } | null;
  invoice?: { _id: string; number: number; status: string } | null;
};
type Club = { settings: Settings; rewards: Reward[]; stats: { members: number; byTier: Record<string, number>; points: number; redemptions: Record<string, { n: number; amount: number }> } };
type MemberDetail = {
  contact: { _id: string; name?: string; phone: string };
  member: Member;
  redemptions: Redemption[];
  adjustments: { _id: string; points: number; reason: string; dedupeKey?: string; createdAt: string }[];
  rewards: Reward[];
  drafts: { _id: string; number: number; total: number; party?: { name?: string } }[];
};

export const redemptionStatusKey: Record<RedemptionStatus, string> = {
  issued: "crmeRedIssued",
  applied: "crmeRedApplied",
  used: "crmeRedUsed",
  cancelled: "crmeRedCancelled",
  expired: "crmeRedExpired",
};
const tone = (st: RedemptionStatus) => (st === "used" ? "ok" : st === "applied" ? "warn" : st === "issued" ? undefined : "muted");

// "10% off (up to 200,000)" / "50,000 off" / the tier's own discount
export const useRewardText = () => {
  const t = useCrmText();
  const f = useBizFormat();
  return (r: { kind: string; value: number; maxDiscount?: number }) =>
    r.kind === "amount"
      ? t("crmeRewardAmount", [f.money(r.value)])
      : r.maxDiscount
        ? t("crmeRewardPercentCap", [f.money(r.value), f.money(r.maxDiscount)])
        : t("crmeRewardPercent", [f.money(r.value)]);
};

const SettingsCard = ({ settings, onSaved }: { settings: Settings; onSaved: () => unknown }) => {
  const t = useCrmText();
  const call = useCall();
  const { canWrite } = useCrm();
  const [v, setV] = useState<Settings>(settings);
  const [busy, setBusy] = useState(false);
  useEffect(() => setV(settings), [settings]);
  const setTier = (key: TierKey, patch: Partial<Tier>) => setV((x) => ({ ...x, tiers: x.tiers.map((tr) => (tr.key === key ? { ...tr, ...patch } : tr)) }));
  const basis = basisOfClub(v);
  // a new basis: its own thresholds, the discounts kept
  const setBasis = (b: TierBasis) =>
    setV((x) => (basisOfClub(x) === b ? x : { ...x, tierBasis: b, tiers: TIERS.map((k) => ({ key: k, min: DEFAULT_MIN[b][k], discount: x.tiers.find((tr) => tr.key === k)?.discount ?? 0 })) }));
  const save = async () => {
    setBusy(true);
    const ok = await call("PUT", "/club/settings", { ...v, tierBasis: basis } as unknown as Record<string, unknown>);
    setBusy(false);
    if (ok) onSaved();
  };
  return (
    <section className={classes.card}>
      <div className={classes.cardHead}>
        <h2 className={classes.cardTitle}>{t("crmeClubSettings")}</h2>
        <label className={s.row}>
          <input type="checkbox" checked={v.enabled} disabled={!canWrite} onChange={(e) => setV((x) => ({ ...x, enabled: e.target.checked }))} />
          {t(v.enabled ? "crmeClubOn" : "crmeClubOff")}
        </label>
      </div>
      <p className={s.hint}>{t("crmeClubHint")}</p>
      <div className={s.stepFields}>
        <label className={classes.field}>
          {t("crmePerVisit")}
          <input type="number" min={0} dir="ltr" value={v.perVisit || 0} disabled={!canWrite} onChange={(e) => setV((x) => ({ ...x, perVisit: Math.max(0, Number(e.target.value) || 0) }))} />
        </label>
        <label className={classes.field}>
          {t("crmePointUnit")}
          <input type="number" min={0} step={1000} dir="ltr" value={v.pointUnit} disabled={!canWrite} onChange={(e) => setV((x) => ({ ...x, pointUnit: Math.max(0, Number(e.target.value) || 0) }))} />
          <span className={s.hint}>{t("crmePointUnitZero")}</span>
        </label>
        <label className={classes.field}>
          {t("crmeCodeDays")}
          <input type="number" min={1} max={365} dir="ltr" value={v.codeDays} disabled={!canWrite} onChange={(e) => setV((x) => ({ ...x, codeDays: Number(e.target.value) || 0 }))} />
        </label>
      </div>
      <label className={classes.field}>
        {t("crmeTierBasis")}
        <select value={basis} disabled={!canWrite} onChange={(e) => setBasis(e.target.value === "visits" ? "visits" : "amount")}>
          <option value="amount">{t("crmeTierBasisAmount")}</option>
          <option value="visits">{t("crmeTierBasisVisits")}</option>
        </select>
        <span className={s.hint}>{t("crmeTierBasisHint")}</span>
      </label>
      <div className={s.stack}>
        <div className={s.tierEdit}>
          <span className={classes.muted}>{t("crmeTier")}</span>
          <span className={classes.muted}>{t(basis === "visits" ? "crmeTierMinVisits" : "crmeTierMin")}</span>
          <span className={classes.muted}>{t("crmeTierDiscount")}</span>
        </div>
        {TIERS.map((k) => {
          const tr = v.tiers.find((x) => x.key === k) || { key: k, min: 0, discount: 0 };
          return (
            <div key={k} className={s.tierEdit}>
              <span className={s.tierName}>{t(tierKey[k])}</span>
              <input
                type="number"
                min={0}
                step={basis === "visits" ? 1 : 1000}
                dir="ltr"
                value={tr.min}
                disabled={!canWrite || k === "basic"}
                onChange={(e) => setTier(k, { min: Math.max(0, basis === "visits" ? Math.round(Number(e.target.value) || 0) : Number(e.target.value) || 0) })}
                aria-label={t(basis === "visits" ? "crmeTierMinVisits" : "crmeTierMin")}
              />
              <input type="number" min={0} max={100} dir="ltr" value={tr.discount} disabled={!canWrite} onChange={(e) => setTier(k, { discount: Number(e.target.value) || 0 })} aria-label={t("crmeTierDiscount")} />
            </div>
          );
        })}
      </div>
      {canWrite && (
        <div className={classes.actions}>
          <button type="button" className={classes.primary} disabled={busy} onClick={save}>
            {t("bizSave")}
          </button>
        </div>
      )}
    </section>
  );
};

const RewardPopup = ({ reward, onDone }: { reward?: Reward; onDone: () => unknown }) => {
  const t = useCrmText();
  const { api } = useCrm();
  const { closePopup } = usePopup();
  const base = { kind: "percent", maxDiscount: 0, active: true, ...(reward || {}) };
  return (
    <PopupCard title={t(reward ? "crmeEditReward" : "crmeNewReward")}>
      <CreateForm<Reward>
        defaultValue={base as Reward}
        renderer={{
          name: { type: "text", title: t("crmeRewardName"), required: true },
          points: { type: "number", title: t("crmeRewardPoints"), required: true },
          kind: { type: "select", title: t("crmeRewardKind"), options: { percent: t("crmeRewardKindPercent"), amount: t("crmeRewardKindAmount") } },
          value: { type: "number", title: t("crmeRewardValue"), required: true, hint: t("crmeRewardValueHint") },
          maxDiscount: { type: "number", price: true, title: t("crmeRewardMax"), hint: t("crmeRewardMaxHint") },
          description: { type: "area", title: t("crmeRewardDesc") },
          active: { type: "bool", title: t("crmeActive") },
        }}
        hookProps={{
          method: reward ? "PATCH" : "POST",
          path: `${API}${api}/club/rewards${reward ? `/${reward._id}` : ""}`,
          parser: "JSON",
          mutator: (inp) => ({ ...base, ...inp }),
          successCb: () => {
            closePopup("CrmeReward");
            onDone();
          },
        }}
        onCancel={() => closePopup("CrmeReward")}
      />
    </PopupCard>
  );
};

const MemberPopup = ({ contactId, onDone }: { contactId: string; onDone: () => unknown }) => {
  const t = useCrmText();
  const f = useBizFormat();
  const w = useWhen();
  const call = useCall();
  const rewardText = useRewardText();
  const { canWrite } = useCrm();
  const { data, error, mutate } = useGet<MemberDetail | null>(`/club/members/${contactId}`, (d) => (d && typeof d === "object" ? (d as MemberDetail) : null));
  const [reward, setReward] = useState("");
  const [pts, setPts] = useState("");
  const [reason, setReason] = useState("");
  const [draft, setDraft] = useState("");
  const done = () => {
    mutate();
    onDone();
  };
  const m = data?.member;
  const drafts = listOf<MemberDetail["drafts"][number]>(data?.drafts);
  return (
    <PopupCard title={data?.contact?.name || t("crmeMember")}>
      <div className={classes.popup}>
        <HandleLoading data={!!data} error={error}>
          {!!data && m && (
            <>
              <div className={s.tiers}>
                <div className={`${s.tier} ${s[`tier_${m.tier}`] || ""}`}>
                  <span className={classes.muted}>{t("crmeTier")}</span>
                  <span className={s.tierName}>{t(tierKey[m.tier])}</span>
                  <span className={classes.muted}>{t("crmeTierDiscountN", [f.money(m.discount)])}</span>
                </div>
                <div className={s.tier}>
                  <span className={classes.muted}>{t("crmePointsBalance")}</span>
                  <span className={s.tierName}>{f.money(m.balance)}</span>
                  <span className={classes.muted}>{t("crmePointsBreakdown", [f.money(m.earned), f.money(m.adjusted), f.money(m.held)])}</span>
                </div>
                <div className={s.tier}>
                  <span className={classes.muted}>{t(m.basis === "visits" ? "crmeVisitCount" : "crmePaidTotal")}</span>
                  <span className={s.tierName}>{f.money(m.basis === "visits" ? m.count || 0 : m.total)}</span>
                  {m.next && <span className={classes.muted}>{t("crmeToNext", [t(tierKey[m.next])])}</span>}
                  {m.next && m.basis === "visits" && <span className={classes.muted}>{t("crmeToNextVisits", [f.money(m.toNext || 0)])}</span>}
                  <span className={s.progress}>
                    <span style={{ width: `${m.progress}%` }} />
                  </span>
                </div>
              </div>
              {canWrite && (
                <div className={s.grid2}>
                  <div className={s.stack}>
                    <label className={classes.field}>
                      {t("crmeRedeemFor")}
                      <select value={reward} onChange={(e) => setReward(e.target.value)}>
                        <option value="">—</option>
                        {listOf<Reward>(data.rewards).map((r) => (
                          <option key={r._id} value={r._id} disabled={r.points > m.balance}>
                            {r.name} · {t("crmePointsN", [f.money(r.points)])}
                          </option>
                        ))}
                      </select>
                    </label>
                    <div className={s.row}>
                      <button
                        type="button"
                        className={classes.primary}
                        disabled={!reward}
                        onClick={async () => {
                          if (await call("POST", `/club/members/${contactId}/redeem`, { reward })) {
                            setReward("");
                            done();
                          }
                        }}
                      >
                        {t("crmeRedeem")}
                      </button>
                      {m.discount > 0 && (
                        <button type="button" className={classes.ghost} onClick={async () => (await call("POST", `/club/members/${contactId}/tier-code`)) && done()}>
                          {t("crmeTierCode")}
                        </button>
                      )}
                    </div>
                  </div>
                  <div className={s.stack}>
                    <div className={s.row}>
                      <label className={classes.field}>
                        {t("crmeAdjustPoints")}
                        <input type="number" dir="ltr" value={pts} onChange={(e) => setPts(e.target.value)} placeholder="+50 / -20" />
                      </label>
                      <label className={classes.field}>
                        {t("crmeReason")}
                        <input value={reason} onChange={(e) => setReason(e.target.value)} maxLength={200} />
                      </label>
                    </div>
                    <button
                      type="button"
                      className={classes.ghost}
                      disabled={!Number(pts) || reason.trim().length < 2}
                      onClick={async () => {
                        if (await call("POST", `/club/members/${contactId}/adjust`, { points: Number(pts), reason })) {
                          setPts("");
                          setReason("");
                          done();
                        }
                      }}
                    >
                      {t("crmeAdjust")}
                    </button>
                  </div>
                </div>
              )}
              <h3 className={classes.cardTitle}>{t("crmeCodes")}</h3>
              {!listOf<Redemption>(data.redemptions).length ? (
                <p className={classes.empty}>{t("crmeNoCodes")}</p>
              ) : (
                <ul className={crm.miniList}>
                  {listOf<Redemption>(data.redemptions).map((r) => (
                    <li key={r._id} className={s.between}>
                      <span className={s.stack}>
                        <span className={s.row}>
                          <span className={s.code}>{r.code}</span>
                          <Badge tone={tone(r.status)}>{t(redemptionStatusKey[r.status])}</Badge>
                        </span>
                        <span className={classes.muted}>
                          {r.kind === "tier" ? t("crmeTierCodeName", [t(tierKey[r.name as TierKey] || r.name)]) : r.name} · {rewardText(r)}
                          {r.invoice ? ` · ${t("crmeInvoiceN", [f.year(r.invoice.number)])}` : ""}
                          {r.discountAmount ? ` · ${f.money(r.discountAmount)}` : ""}
                          {r.status === "issued" && r.expiresAt ? ` · ${t("crmeUntil", [f.date(r.expiresAt)])}` : ""}
                        </span>
                      </span>
                      {canWrite && (
                        <span className={crm.rowActions}>
                          {r.status === "issued" && drafts.length > 0 && (
                            <>
                              <select value={draft} onChange={(e) => setDraft(e.target.value)} className={crm.inlineSelect} aria-label={t("crmeDraftInvoice")}>
                                <option value="">{t("crmeDraftInvoice")}</option>
                                {drafts.map((d) => (
                                  <option key={d._id} value={d._id}>
                                    {t("crmeInvoiceN", [f.year(d.number)])} · {f.money(d.total)}
                                  </option>
                                ))}
                              </select>
                              <button
                                type="button"
                                className={classes.ghost}
                                disabled={!draft}
                                onClick={async () => (await call("POST", "/club/redemptions/apply", { code: r.code, invoice: draft })) && done()}
                              >
                                {t("crmeApply")}
                              </button>
                            </>
                          )}
                          {r.status === "applied" && (
                            <button type="button" className={classes.ghost} onClick={async () => (await call("POST", `/club/redemptions/${r._id}/unapply`)) && done()}>
                              {t("crmeUnapply")}
                            </button>
                          )}
                          {(r.status === "issued" || r.status === "applied") && (
                            <ConfirmButton onConfirm={async () => (await call("POST", `/club/redemptions/${r._id}/cancel`, { reason: "" })) && done()}>{t("crmCancel")}</ConfirmButton>
                          )}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
              {listOf<Redemption>(data.redemptions).some((r) => r.status === "issued") && !drafts.length && <p className={s.hint}>{t("crmeNoDraftsHint")}</p>}
              {listOf<MemberDetail["adjustments"][number]>(data.adjustments).length > 0 && (
                <>
                  <h3 className={classes.cardTitle}>{t("crmeAdjustments")}</h3>
                  <ul className={crm.miniList}>
                    {listOf<MemberDetail["adjustments"][number]>(data.adjustments).map((a) => (
                      <li key={a._id} className={s.between}>
                        <span>
                          <bdi dir="ltr" className={s.strong}>
                            {a.points > 0 ? `+${a.points}` : a.points}
                          </bdi>{" "}
                          · {a.reason} · <span className={classes.muted}>{w.at(a.createdAt)}</span>
                        </span>
                        {canWrite && !a.dedupeKey && (
                          <ConfirmButton onConfirm={async () => (await call("DELETE", `/club/adjustments/${a._id}`)) && done()}>{t("bizDelete")}</ConfirmButton>
                        )}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </>
          )}
        </HandleLoading>
      </div>
    </PopupCard>
  );
};

const CrmClub = () => {
  const t = useCrmText();
  const f = useBizFormat();
  const ctx = useCrm();
  const { canWrite } = ctx;
  const call = useCall();
  const rewardText = useRewardText();
  const { setPopup } = usePopup();
  const club = useGet<Club | null>("/club", (d) => (d && typeof d === "object" ? (d as Club) : null));
  const members = useGet<Member[]>("/club/members", (d) => listOf<Member>(d));
  const reds = useGet<Redemption[]>("/club/redemptions", (d) => listOf<Redemption>(d));
  const refresh = () => {
    club.mutate();
    members.mutate();
    reds.mutate();
  };
  const withCtx = (n: React.ReactNode) => <CrmContext.Provider value={ctx}>{n}</CrmContext.Provider>;
  const openMember = (id: string) => setPopup("CrmeMember", withCtx(<MemberPopup contactId={id} onDone={refresh} />));
  const openReward = (r?: Reward) => setPopup("CrmeReward", withCtx(<RewardPopup reward={r} onDone={refresh} />));
  const c = club.data;
  return (
    <HandleLoading data={!!c} error={club.error}>
      {!!c && (
        <div className={s.stack}>
          <div className={classes.tiles}>
            <div className={classes.tile}>
              <span className={classes.tileLabel}>{t("crmeMembers")}</span>
              <span className={classes.tileValue}>{f.money(c.stats?.members || 0)}</span>
            </div>
            {TIERS.filter((k) => k !== "basic").map((k) => (
              <div key={k} className={classes.tile}>
                <span className={classes.tileLabel}>{t(tierKey[k])}</span>
                <span className={classes.tileValue}>{f.money(c.stats?.byTier?.[k] || 0)}</span>
              </div>
            ))}
            <div className={classes.tile}>
              <span className={classes.tileLabel}>{t("crmePointsOut")}</span>
              <span className={classes.tileValue}>{f.money(c.stats?.points || 0)}</span>
            </div>
            <div className={classes.tile}>
              <span className={classes.tileLabel}>{t("crmeDiscountGiven")}</span>
              <span className={classes.tileValue}>{f.money(c.stats?.redemptions?.used?.amount || 0)}</span>
            </div>
          </div>
          <div className={s.grid2}>
            <SettingsCard settings={c.settings} onSaved={refresh} />
            <section className={classes.card}>
              <div className={classes.cardHead}>
                <h2 className={classes.cardTitle}>{t("crmeRewards")}</h2>
                {canWrite && (
                  <button type="button" className={classes.primary} onClick={() => openReward()}>
                    {t("crmeNewReward")}
                  </button>
                )}
              </div>
              <p className={s.hint}>{t("crmeRewardsHint")}</p>
              {!listOf<Reward>(c.rewards).length ? (
                <p className={classes.empty}>{t("crmeNoRewards")}</p>
              ) : (
                <ul className={crm.miniList}>
                  {listOf<Reward>(c.rewards).map((r) => (
                    <li key={r._id} className={s.between}>
                      <span className={s.stack}>
                        <span className={s.strong}>{r.name}</span>
                        <span className={classes.muted}>
                          {t("crmePointsN", [f.money(r.points)])} · {rewardText(r)}
                        </span>
                      </span>
                      <span className={crm.rowActions}>
                        {!r.active && <Badge tone="muted">{t("crmInactive")}</Badge>}
                        {canWrite && (
                          <>
                            <IconButton onClick={() => openReward(r)} title={t("crmeEditReward")}>
                              <EditIcon />
                            </IconButton>
                            <ConfirmButton label={t("bizDelete")} onConfirm={async () => (await call("DELETE", `/club/rewards/${r._id}`)) && refresh()}>
                              <GarbageIcon />
                            </ConfirmButton>
                          </>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
          <section className={classes.card}>
            <h2 className={classes.cardTitle}>{t("crmeMembers")}</h2>
            <HandleLoading data={!!members.data} error={members.error}>
              <Table
                data={listOf<Member>(members.data)}
                name="CrmClubMembers"
                renderer={{
                  name: { name: t("crmName"), value: (m) => m.name || "", filter: "Text" },
                  phone: { name: t("crmPhone"), value: (m) => m.phone || "", component: (m) => <bdi dir="ltr">{phoneText(m.phone || "")}</bdi> },
                  tier: { name: t("crmeTier"), value: (m) => t(tierKey[m.tier] || tierKey.basic), filter: "Set" },
                  count: { name: t("crmeVisitCount"), value: (m) => m.count || 0, filter: "Number", component: (m) => f.money(m.count || 0) },
                  total: { name: t("crmePaidTotal"), value: (m) => m.total, filter: "Number", component: (m) => f.money(m.total) },
                  balance: { name: t("crmePointsBalance"), value: (m) => m.balance, filter: "Number", component: (m) => f.money(m.balance) },
                  actions: {
                    name: t("crmeActions"),
                    component: (m) => (
                      <TableActions>
                        <IconButton onClick={() => openMember(m.contact)} title={t("crmeOpenMember")}>
                          <EyeIcon />
                        </IconButton>
                      </TableActions>
                    ),
                  },
                }}
              />
            </HandleLoading>
          </section>
          <section className={classes.card}>
            <h2 className={classes.cardTitle}>{t("crmeCodes")}</h2>
            <p className={s.hint}>{t("crmeCodesHint")}</p>
            <HandleLoading data={!!reds.data} error={reds.error}>
              <Table
                data={listOf<Redemption>(reds.data)}
                name="CrmClubCodes"
                renderer={{
                  code: { name: t("crmeCode"), value: (r) => r.code, filter: "Text", component: (r) => <span className={s.code}>{r.code}</span> },
                  contact: { name: t("crmName"), value: (r) => r.contact?.name || r.contact?.phone || "" },
                  reward: { name: t("crmeReward"), value: (r) => (r.kind === "tier" ? t("crmeTierCodeName", [t(tierKey[r.name as TierKey] || r.name)]) : r.name) },
                  status: { name: t("crmeStatus"), value: (r) => t(redemptionStatusKey[r.status]), filter: "Set", component: (r) => <Badge tone={tone(r.status)}>{t(redemptionStatusKey[r.status])}</Badge> },
                  discount: { name: t("crmeDiscount"), value: (r) => r.discountAmount, filter: "Number", component: (r) => (r.discountAmount ? f.money(r.discountAmount) : "—") },
                  invoice: { name: t("crmeInvoice"), value: (r) => (r.invoice ? r.invoice.number : "") },
                  createdAt: { name: t("bizDate"), value: (r) => new Date(r.createdAt), filter: "Date" },
                  actions: {
                    name: t("crmeActions"),
                    component: (r) =>
                      r.contact ? (
                        <TableActions>
                          <IconButton onClick={() => openMember(r.contact!._id)} title={t("crmeOpenMember")}>
                            <EyeIcon />
                          </IconButton>
                        </TableActions>
                      ) : null,
                  },
                }}
              />
            </HandleLoading>
          </section>
        </div>
      )}
    </HandleLoading>
  );
};

export default CrmClub;
