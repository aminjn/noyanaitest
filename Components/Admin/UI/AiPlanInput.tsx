"use client";

import { useState } from "react";
import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import { adminIntlTag, ta } from "@/Components/Admin/i18n/adminText";
import ToggleInput from "@/Components/UI/ToggleInput";
import Input from "@/Components/UI/Input";
import Loading from "./Loading";
import classes from "./AiPlanInput.module.css";

// The AI a plan sells (2026-10, backend Lib/ai/planAi.ts): which AI features
// of the registry (Lib/ai/aiFeatures.ts) the plan includes - unlocking them
// for its holders even where the AI policy's modules would not - and the
// plan's own limits for them (empty = the policy's "with a plan" limits,
// 0 = unlimited). The list comes from the server for the plan's kind, so a
// new AI feature appears here without a front-end change. Wired into
// CreateForm as the "aiPlan" field of every plan editor (provider plans and
// patient Pro).

type Limits = { day?: number; month?: number; orgMonth?: number };
type Feature = {
  key: string;
  group: string;
  unit: "request" | "minute";
  title: string;
  description: string;
  policy?: { access: string; limits: { paid: { day: number; month: number; orgMonth: number } } };
};
export type AiPlanValue = { aiFeatures: string[]; aiQuotas: Record<string, Limits> };

const latin = (v: string) => v.replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d))).trim();

const AiPlanInput = ({
  title,
  audience,
  defaultFeatures,
  defaultQuotas,
  readOnly,
  onChange,
}: {
  title: string;
  audience: string;
  defaultFeatures?: string[];
  defaultQuotas?: Record<string, Limits>;
  readOnly?: boolean;
  onChange: (v: AiPlanValue) => unknown;
}) => {
  const { data, error } = useSWR<Feature[]>(`${API}/admin/ai/features?audience=${audience}`, (url: string) =>
    fetcher({ url }).then((res) => (Array.isArray(res?.data) ? res.data : [])),
  );
  const [value, setValue] = useState<AiPlanValue>({
    aiFeatures: Array.isArray(defaultFeatures) ? defaultFeatures : [],
    aiQuotas: defaultQuotas && typeof defaultQuotas === "object" ? defaultQuotas : {},
  });
  const set = (next: AiPlanValue) => {
    setValue(next);
    onChange(next);
  };
  const n = new Intl.NumberFormat(adminIntlTag());
  const org = audience !== "patient";
  const hint = (v?: number) => (v ? n.format(v) : ta("نامحدود"));

  return (
    <fieldset className={classes.main}>
      <legend className={classes.title}>{title}</legend>
      <p className={classes.note}>
        {ta("قابلیتی که اینجا روشن شود برای دارندگان این پلن باز است، حتی اگر در «سیاست هوش مصنوعی» فقط با ماژول دیگری باز شود. سقف خالی یعنی سقف «با پلن» همان سیاست؛ ۰ یعنی نامحدود.")}
      </p>
      {!data && !error && <Loading />}
      <div className={classes.list}>
        {(data || []).map((f) => {
          const on = value.aiFeatures.includes(f.key);
          const q = value.aiQuotas[f.key] || {};
          const paid = f.policy?.limits?.paid;
          const setQuota = (k: keyof Limits) => (e: { target: { value: string } }) => {
            const raw = latin(e.target.value);
            const nextQ: Limits = { ...q };
            if (raw === "") delete nextQ[k];
            else nextQ[k] = Math.max(0, Math.round(Number(raw) || 0));
            const quotas = { ...value.aiQuotas };
            if (Object.keys(nextQ).length) quotas[f.key] = nextQ;
            else delete quotas[f.key];
            set({ ...value, aiQuotas: quotas });
          };
          return (
            <div key={f.key} className={`${classes.row} ${on ? classes.on : ""}`}>
              <div className={classes.head}>
                <ToggleInput
                  title={ta(f.title)}
                  value={on}
                  readOnly={readOnly}
                  onChange={() =>
                    set({
                      ...value,
                      aiFeatures: on ? value.aiFeatures.filter((k) => k !== f.key) : [...value.aiFeatures, f.key],
                    })
                  }
                />
                {f.policy?.access === "off" && <span className={classes.off}>{ta("در سیاست خاموش است")}</span>}
              </div>
              {(on || Object.keys(q).length > 0) && (
                <div className={classes.quotas}>
                  <Input
                    type="text"
                    title={ta("در روز (پیش‌فرض: ${1})", [hint(paid?.day)])}
                    defaultValue={q.day !== undefined ? String(q.day) : ""}
                    readOnly={readOnly}
                    onChange={setQuota("day")}
                  />
                  <Input
                    type="text"
                    title={ta("در ماه (پیش‌فرض: ${1})", [hint(paid?.month)])}
                    defaultValue={q.month !== undefined ? String(q.month) : ""}
                    readOnly={readOnly}
                    onChange={setQuota("month")}
                  />
                  {org && (
                    <Input
                      type="text"
                      title={ta("هر مجموعه در ماه (پیش‌فرض: ${1})", [hint(paid?.orgMonth)])}
                      defaultValue={q.orgMonth !== undefined ? String(q.orgMonth) : ""}
                      readOnly={readOnly}
                      onChange={setQuota("orgMonth")}
                    />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </fieldset>
  );
};

export default AiPlanInput;
