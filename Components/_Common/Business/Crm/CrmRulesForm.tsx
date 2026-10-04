"use client";

import { useEffect, useState } from "react";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import NodesSelector from "@/Components/UI/NodesSelector";
import classes from "../Accounting.module.css";
import crm from "./Crm.module.css";
import { useBizFormat } from "../bizShared";
import { CrmInsurer, CrmRules, hasRules, insurerKey, phoneText, useCrm, useCrmText } from "./crmShared";

// The contact rules editor (2026-10), shared by the contacts filter, a
// saved segment, a campaign's audience and an automation's audience: tags
// (created inline), last visit, visits, spending, no-shows, birthdays,
// gender and age, city and insurer. Shows how many contacts match, live.

const n = (s: string) => {
  const v = Math.round(Number(String(s).replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d))).replace(/[^\d]/g, "")));
  return Number.isFinite(v) && v > 0 ? v : null;
};
const numText = (v?: number | null) => (v ? String(v) : "");

export const TagPicker = ({
  value,
  onChange,
  title,
  readOnly,
}: {
  value: string[];
  onChange: (v: string[]) => unknown;
  title?: string;
  readOnly?: boolean;
}) => {
  const { api, canWrite } = useCrm();
  return (
    <NodesSelector
      multi
      title={title}
      path={`${API}${api}/tag-options`}
      dataParser={(res) => {
        const list = (res as { data?: { data?: unknown } })?.data?.data;
        return Array.isArray(list) ? list : [];
      }}
      getOptionValue={(o) => String((o as { _id?: string })?._id ?? "")}
      getOptionLabel={(o) => String((o as { name?: string })?.name ?? "")}
      defaultValue={value}
      onChange={(v) => onChange(Array.isArray(v) ? v : [])}
      readOnly={readOnly}
      creatable={canWrite ? { path: `${API}${api}/tag-options` } : undefined}
    />
  );
};

const CrmRulesForm = ({
  rules,
  onChange,
  showCount = true,
  compact = false,
  hideTags = false,
}: {
  rules: CrmRules;
  onChange: (r: CrmRules) => unknown;
  showCount?: boolean;
  compact?: boolean;
  // the tags are picked by the caller's own field (a chronic automation)
  hideTags?: boolean;
}) => {
  const t = useCrmText();
  const f = useBizFormat();
  const { api } = useCrm();
  const set = <K extends keyof CrmRules>(k: K, v: CrmRules[K]) => onChange({ ...rules, [k]: v });
  const [count, setCount] = useState<{ count: number; reachable: number; sample: { name?: string; phone: string }[] } | null>(null);
  const key = JSON.stringify(rules);
  useEffect(() => {
    if (!showCount) return;
    const h = setTimeout(() => {
      fetcher({ url: `${API}${api}/segments/count`, method: "POST", payload: { rules: JSON.parse(key) } })
        .then((res) => setCount(res.data as typeof count))
        .catch(() => setCount(null));
    }, 400);
    return () => clearTimeout(h);
  }, [api, key, showCount]);
  const numField = (k: keyof CrmRules, label: string) => (
    <label className={classes.field}>
      {t(label)}
      <input value={numText(rules[k] as number | null)} onChange={(e) => set(k, n(e.target.value) as never)} inputMode="numeric" />
    </label>
  );
  return (
    <div className={crm.rules}>
      <div className={classes.form}>
        {!hideTags && (
        <div className={`${classes.field} ${classes.wide}`}>
          <TagPicker title={t("crmRuleTags")} value={rules.tags} onChange={(v) => set("tags", v)} />
          {rules.tags.length > 1 && (
            <label className={crm.check}>
              <input type="checkbox" checked={!!rules.tagsAll} onChange={(e) => set("tagsAll", e.target.checked)} />
              {t("crmRuleTagsAll")}
            </label>
          )}
        </div>
        )}
        {numField("inactiveDays", "crmInactiveDays")}
        {numField("activeDays", "crmActiveDays")}
        {numField("minVisits", "crmMinVisits")}
        {!compact && numField("minSpent", "crmRuleMinSpent")}
        {!compact && numField("noShowDays", "crmRuleNoShowDays")}
        {!compact && numField("newDays", "crmRuleNewDays")}
        <label className={classes.field}>
          {t("crmRuleBirthday")}
          <select value={rules.birthday || ""} onChange={(e) => set("birthday", (e.target.value || null) as CrmRules["birthday"])}>
            <option value="">{t("crmAny")}</option>
            <option value="today">{t("crmRuleBirthdayToday")}</option>
            <option value="week">{t("crmRuleBirthdayWeek")}</option>
            <option value="month">{t("crmRuleBirthdayMonth")}</option>
          </select>
        </label>
        <label className={classes.field}>
          {t("crmGender")}
          <select value={rules.gender || ""} onChange={(e) => set("gender", (e.target.value || null) as CrmRules["gender"])}>
            <option value="">{t("crmAny")}</option>
            <option value="female">{t("crmFemale")}</option>
            <option value="male">{t("crmMale")}</option>
          </select>
        </label>
        {numField("ageMin", "crmRuleAgeMin")}
        {numField("ageMax", "crmRuleAgeMax")}
        {!compact && (
          <label className={classes.field}>
            {t("crmCity")}
            <input value={rules.city || ""} onChange={(e) => set("city", e.target.value || null)} maxLength={100} />
          </label>
        )}
        <label className={classes.field}>
          {t("crmInsurer")}
          <select value={rules.insurer || ""} onChange={(e) => set("insurer", (e.target.value || null) as CrmInsurer | null)}>
            <option value="">{t("crmAny")}</option>
            {(Object.keys(insurerKey) as CrmInsurer[]).map((k) => (
              <option key={k} value={k}>
                {t(insurerKey[k])}
              </option>
            ))}
          </select>
        </label>
        <label className={`${crm.check} ${crm.checkField}`}>
          <input type="checkbox" checked={!!rules.highValue} onChange={(e) => set("highValue", e.target.checked)} />
          {t("crmSegHighValue")}
        </label>
      </div>
      {showCount && (
        <p className={crm.liveCount} aria-live="polite">
          {count
            ? t("crmRuleCount", [f.money(count.count), f.money(count.reachable)])
            : hasRules(rules)
              ? "…"
              : t("crmRuleCountAll")}
          {!!count?.sample?.length && (
            <span className={classes.muted}> · {count.sample.map((s) => s.name || phoneText(s.phone)).join("، ")}</span>
          )}
        </p>
      )}
    </div>
  );
};

// the rules as short phrases ("no visit in 180 days · tag: diabetes")
export const useRulesSummary = () => {
  const t = useCrmText();
  const f = useBizFormat();
  return (r?: Partial<CrmRules> | null) => {
    if (!r) return [] as string[];
    const out: string[] = [];
    if (r.tags?.length) out.push(`${t("crmRuleTags")}: ${r.tags.join(r.tagsAll ? " + " : " / ")}`);
    if (r.inactiveDays) out.push(t("crmSumInactive", [f.money(r.inactiveDays)]));
    if (r.activeDays) out.push(t("crmSumActive", [f.money(r.activeDays)]));
    if (r.minVisits) out.push(t("crmSumMinVisits", [f.money(r.minVisits)]));
    if (r.minSpent) out.push(t("crmSumMinSpent", [f.money(r.minSpent)]));
    if (r.noShowDays) out.push(t("crmSumNoShow", [f.money(r.noShowDays)]));
    if (r.newDays) out.push(t("crmSumNew", [f.money(r.newDays)]));
    if (r.birthday) out.push(t(r.birthday === "today" ? "crmRuleBirthdayToday" : r.birthday === "week" ? "crmRuleBirthdayWeek" : "crmRuleBirthdayMonth"));
    if (r.gender) out.push(t(r.gender === "female" ? "crmFemale" : "crmMale"));
    if (r.ageMin || r.ageMax) out.push(t("crmSumAge", [f.money(r.ageMin || 0), r.ageMax ? f.money(r.ageMax) : "∞"]));
    if (r.city) out.push(`${t("crmCity")}: ${r.city}`);
    if (r.insurer) out.push(t(insurerKey[r.insurer]));
    if (r.highValue) out.push(t("crmSegHighValue"));
    return out;
  };
};

export default CrmRulesForm;
