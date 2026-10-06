"use client";
import { TEHRAN_TZ } from "@/Components/helpers/tehranTime";

import Link from "@/Components/i18n/Link";
import { useIntlLocale } from "@/Components/i18n/navigation";
import { adminIntlTag } from "@/Components/Admin/i18n/adminText";
import Ixon from "@/Components/UI/Ixon";
import LockIcon from "@/Components/Icons/LockIcon";
import ClockIcon from "@/Components/Icons/ClockIcon";
import { AiProfile, T, useAiStatus, useAiText } from "./aiShared";
import classes from "./Ai.module.css";

// The one locked / limit-reached state of every AI tool (2026-10, backend
// Lib/ai/aiGate.ts): the AI policy of the super admin decides per feature
// whether it is free, sold by plan or off, and its limits. A page shows
// this instead of the tool's button when the feature is not in the plan or
// its quota is used up, and in place of the error when a request is
// refused. A feature switched off is hidden, not shown locked.

export type AiGateInfo = {
  code: "off" | "notInPlan" | "limit";
  feature?: string;
  scope?: "day" | "month" | "orgMonth";
  limit?: number;
  used?: number;
  unit?: "request" | "minute";
  resetAt?: string;
  upgrade?: string | null;
};

export type AiFeatureState = {
  key: string;
  group: string;
  unit: "request" | "minute";
  state: "ok" | "off" | "notInPlan" | "limit";
  tier?: "free" | "paid";
  limit?: number;
  used?: number;
  remaining?: number | null;
  monthLimit?: number;
  monthUsed?: number;
  resetAt?: string;
  upgrade?: string | null;
};

const CODES = ["off", "notInPlan", "limit"];

// the AI refusal of a failed request (FetchError.ai), if it was one
export const aiGateOf = (err: unknown): AiGateInfo | null => {
  const ai = (err as { ai?: unknown } | null)?.ai as AiGateInfo | undefined;
  return ai && typeof ai === "object" && CODES.includes(ai.code) ? ai : null;
};

// a feature's state as a gate (null when it can be used)
export const gateOfState = (st?: AiFeatureState | null): AiGateInfo | null => {
  if (!st || st.state === "ok") return null;
  if (st.state === "limit") {
    const month = !!st.monthLimit && (st.monthUsed || 0) >= st.monthLimit;
    return { code: "limit", feature: st.key, scope: month ? "month" : "day", resetAt: st.resetAt, upgrade: st.upgrade, unit: st.unit };
  }
  return { code: st.state, feature: st.key, upgrade: st.upgrade, unit: st.unit };
};

// a feature of the profile's panel, from GET /ai/<profile>/status
export const useAiFeature = (profile: AiProfile | null, key: string) => {
  const { status, error } = useAiStatus(profile);
  const st = status?.features?.[key];
  return { state: st, gate: gateOfState(st), loading: !status && !error, configured: !!status?.configured };
};

const AiLocked = ({ profile, gate, compact }: { profile: AiProfile; gate: AiGateInfo | null | undefined; compact?: boolean }) => {
  const t = useAiText(profile);
  const intl = useIntlLocale();
  if (!gate || gate.code === "off") {
    if (gate?.code !== "off") return null;
    return (
      <p className={`${classes.notice} ${compact ? classes.noticeCompact : ""}`} role="note">
        {t(T("aiFeatureOff", "این قابلیت هوش مصنوعی در حال حاضر فعال نیست"))}
      </p>
    );
  }
  const admin = profile === "admin";
  const patient = profile === "user";
  const upgrade = gate.upgrade || null;
  const upgradeLink = upgrade && !admin && (
    <Link href={upgrade}>{patient ? t(T("aiGetPro", "اشتراک پرو")) : t(T("aiUpgrade", "ارتقای پلن"))}</Link>
  );
  if (gate.code === "notInPlan")
    return (
      <p className={`${classes.notice} ${classes.locked} ${compact ? classes.noticeCompact : ""}`} role="note">
        <Ixon width="1rem">
          <LockIcon />
        </Ixon>
        <span>{t(T("aiLockedPlan", "این قابلیت در پلن شما نیست"))}</span>
        {upgradeLink}
        {!patient && !admin && <Link href="/pricing">{t(T("aiComparePlans", "مقایسه‌ی پلن‌ها"))}</Link>}
      </p>
    );
  // limit reached: when it opens again, in the reader's calendar
  const at = gate.resetAt ? new Date(gate.resetAt) : null;
  const tag = admin ? adminIntlTag() : intl;
  let when = "";
  if (at && !Number.isNaN(at.getTime()))
    try {
      when =
        gate.scope === "day"
          ? new Intl.DateTimeFormat(tag, { weekday: "long", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Tehran" }).format(at)
          : new Intl.DateTimeFormat(tag, { day: "numeric", month: "long", timeZone: "Asia/Tehran" }).format(at);
    } catch {
      when = at.toLocaleString(undefined, { timeZone: TEHRAN_TZ });
    }
  const text =
    gate.scope === "orgMonth"
      ? T("aiLimitOrg", "سقف ماهانه‌ی این قابلیت برای مجموعه‌ی شما پر شد؛ از ${1} دوباره در دسترس است")
      : gate.scope === "month"
        ? T("aiLimitMonth", "سهمیه‌ی این ماه این قابلیت تمام شد؛ از ${1} دوباره در دسترس است")
        : T("aiLimitDay", "سهمیه‌ی امروز این قابلیت تمام شد؛ از ${1} دوباره در دسترس است");
  return (
    <p className={`${classes.notice} ${compact ? classes.noticeCompact : ""}`} role="status">
      <Ixon width="1rem">
        <ClockIcon />
      </Ixon>
      <span>{t(text, [when || "—"])}</span>
      {upgradeLink}
    </p>
  );
};

// today's quota left of a feature ("12 of 200 left today"), nothing when
// unlimited
export const AiQuota = ({ profile, state }: { profile: AiProfile; state?: AiFeatureState | null }) => {
  const t = useAiText(profile);
  const intl = useIntlLocale();
  if (!state || state.state !== "ok" || !state.limit) return null;
  const fmt = new Intl.NumberFormat(profile === "admin" ? adminIntlTag() : intl);
  const left = fmt.format(Math.max(0, state.remaining ?? state.limit - (state.used || 0)));
  const total = fmt.format(state.limit);
  return (
    <span className={classes.quota}>
      {state.unit === "minute"
        ? t(T("aiLeftMinutes", "امروز ${1} از ${2} دقیقه باقی مانده"), [left, total])
        : t(T("aiLeftToday", "امروز ${1} از ${2} باقی مانده"), [left, total])}
    </span>
  );
};

export default AiLocked;
