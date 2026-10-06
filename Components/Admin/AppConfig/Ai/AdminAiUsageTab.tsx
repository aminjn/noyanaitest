"use client";
import { TEHRAN_TZ } from "@/Components/helpers/tehranTime";

import { useMemo, useState } from "react";
import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import { adminPath } from "@/Components/helpers/adminPath";
import { adminIntlTag, ta } from "@/Components/Admin/i18n/adminText";
import SelectInput from "@/Components/UI/SelectInput";
import HandleLoading from "../../UI/HandleLoading";
import WithTitle from "../../UI/WithTitle";
import Box from "../../UI/Box";
import Table from "../../UI/Table";
import InlineLink from "../../UI/InlineLink";
import { AiFeatureDef, audienceLabel, unitLabel } from "./aiPolicyShared";
import classes from "./AdminAiPolicy.module.css";

// «گزارش مصرف هوش مصنوعی» (2026-10, backend GET /admin/ai/usage over
// Models/AiUsage.ts): per feature, per day, per audience, the free / paid
// split, and the users and organisations that use AI most. Replaces the one
// line of panel AI totals the settings tab had.

type Usage = {
  days: number;
  from: string;
  totals: { requests: number; units: number; failed: number };
  byFeature: { feature: string; units: number; requests: number; failed: number; users: number }[];
  byDay: { day: string; feature: string; units: number; requests: number }[];
  byAudience: { audience: string; units: number; requests: number; users: number }[];
  byTier: Record<string, number>;
  topUsers: { id: string; name: string; phone: string; audience: string; requests: number; units: number; features: string[] }[];
  topOrgs: { id: string; kind: string; name: string; requests: number; units: number; features: string[] }[];
};

const ORG_PATH: Record<string, string> = {
  doctor: "/doctorprofile",
  clinic: "/clinic",
  hospital: "/hospital",
  pharmacy: "/pharmacy",
  paraClinic: "/paraClinic",
  insurance: "/insurance",
};

const arr = <T,>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);

const AdminAiUsageTab = () => {
  const [days, setDays] = useState("30");
  const [feature, setFeature] = useState("");
  const [audience, setAudience] = useState("");
  const qs = new URLSearchParams({ days, ...(feature ? { feature } : {}), ...(audience ? { audience } : {}) }).toString();
  const { data, error } = useSWR<Usage>(`${API}/admin/ai/usage?${qs}`, (url: string) => fetcher({ url }).then((res) => res.data));
  const { data: policy } = useSWR<{ features: AiFeatureDef[] }>(`${API}/admin/ai/policy`, (url: string) =>
    fetcher({ url }).then((res) => res.data),
  );
  const defs = useMemo(() => arr<AiFeatureDef>(policy?.features), [policy]);
  const titleOf = (key: string) => {
    const d = defs.find((f) => f.key === key);
    return d ? ta(d.title) : key;
  };
  const unitOf = (key: string) => defs.find((f) => f.key === key)?.unit || "request";
  const n = new Intl.NumberFormat(adminIntlTag());

  // requests per day, every feature together (or the one filtered)
  const series = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of arr<Usage["byDay"][number]>(data?.byDay)) map.set(r.day, (map.get(r.day) || 0) + (r.requests || 0));
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [data]);
  const peak = Math.max(1, ...series.map(([, v]) => v));
  const paidShare = data ? (data.byTier?.paid || 0) / Math.max(1, (data.byTier?.paid || 0) + (data.byTier?.free || 0)) : 0;

  return (
    <div className={classes.stack}>
      <WithTitle title={ta("گزارش مصرف هوش مصنوعی")}>
        <div className={classes.filters}>
          <SelectInput
            title={ta("بازه")}
            defaultValue="30"
            options={{ "7": ta("۷ روز اخیر"), "30": ta("۳۰ روز اخیر"), "90": ta("۹۰ روز اخیر"), "365": ta("یک سال اخیر") }}
            onChange={(e) => setDays(e.target.value)}
          />
          <SelectInput
            title={ta("قابلیت")}
            defaultValue=""
            options={{ "": ta("همه‌ی قابلیت‌ها"), ...Object.fromEntries(defs.map((d) => [d.key, ta(d.title)])) }}
            onChange={(e) => setFeature(e.target.value)}
          />
          <SelectInput
            title={ta("مخاطب")}
            defaultValue=""
            options={{
              "": ta("همه"),
              ...Object.fromEntries(
                ["patient", "doctor", "clinic", "hospital", "pharmacy", "paraClinic", "insurance", "staff", "admin"].map((a) => [a, audienceLabel(a)]),
              ),
            }}
            onChange={(e) => setAudience(e.target.value)}
          />
        </div>
      </WithTitle>
      <HandleLoading data={!!data} error={error}>
        {!!data && (
          <>
            <Box className={classes.box}>
              <dl className={classes.stats}>
                <div className={classes.stat}>
                  <dt>{ta("درخواست‌ها")}</dt>
                  <dd>{n.format(data.totals?.requests || 0)}</dd>
                </div>
                <div className={classes.stat}>
                  <dt>{ta("ناموفق (برگشت داده شد)")}</dt>
                  <dd>{n.format(data.totals?.failed || 0)}</dd>
                </div>
                <div className={classes.stat}>
                  <dt>{ta("سهم کاربران پلن‌دار")}</dt>
                  <dd>{new Intl.NumberFormat(adminIntlTag(), { style: "percent" }).format(paidShare)}</dd>
                </div>
                {arr<Usage["byAudience"][number]>(data.byAudience).map((a) => (
                  <div key={a.audience} className={classes.stat}>
                    <dt>{audienceLabel(a.audience)}</dt>
                    <dd>
                      {n.format(a.requests)}
                      <span className={classes.note}> · {ta("${1} کاربر", [n.format(a.users)])}</span>
                    </dd>
                  </div>
                ))}
              </dl>
              <h3 className={classes.sectionTitle}>{ta("درخواست‌ها در هر روز")}</h3>
              {series.length ? (
                <>
                  <div className={classes.bars} role="img" aria-label={ta("درخواست‌ها در هر روز")}>
                    {series.map(([day, v]) => (
                      <span
                        key={day}
                        className={classes.bar}
                        style={{ blockSize: `${Math.max(2, (v / peak) * 100)}%` }}
                        title={`${new Intl.DateTimeFormat(adminIntlTag(), { timeZone: TEHRAN_TZ, day: "numeric", month: "short" }).format(new Date(`${day}T12:00:00+03:30`))}: ${n.format(v)}`}
                      />
                    ))}
                  </div>
                  <div className={classes.barsAxis}>
                    <span>{new Intl.DateTimeFormat(adminIntlTag(), { timeZone: TEHRAN_TZ, day: "numeric", month: "short" }).format(new Date(`${series[0][0]}T12:00:00+03:30`))}</span>
                    <span>{new Intl.DateTimeFormat(adminIntlTag(), { timeZone: TEHRAN_TZ, day: "numeric", month: "short" }).format(new Date(`${series[series.length - 1][0]}T12:00:00+03:30`))}</span>
                  </div>
                </>
              ) : (
                <p className={classes.note}>{ta("در این بازه استفاده‌ای ثبت نشده است.")}</p>
              )}
            </Box>

            <WithTitle title={ta("مصرف هر قابلیت")}>
              <Table
                toolbar={false}
                exportable
                name="AdminAiUsageFeatures"
                data={arr<Usage["byFeature"][number]>(data.byFeature).map((r) => ({ ...r, _id: r.feature }))}
                renderer={{
                  feature: { name: ta("قابلیت"), value: (r) => titleOf(r.feature), filter: "Text" },
                  requests: { name: ta("درخواست"), value: (r) => r.requests, filter: "Number" },
                  units: {
                    name: ta("مقدار"),
                    value: (r) => r.units,
                    filter: "Number",
                    component: (r) => <>{`${n.format(r.units)} ${unitLabel(unitOf(r.feature))}`}</>,
                  },
                  users: { name: ta("کاربران"), value: (r) => r.users, filter: "Number" },
                  failed: { name: ta("ناموفق"), value: (r) => r.failed, filter: "Number" },
                }}
              />
            </WithTitle>

            <WithTitle title={ta("پرمصرف‌ترین کاربران")}>
              <Table
                toolbar={false}
                exportable
                name="AdminAiUsageUsers"
                data={arr<Usage["topUsers"][number]>(data.topUsers).map((r) => ({ ...r, _id: r.id }))}
                renderer={{
                  name: {
                    name: ta("کاربر"),
                    value: (r) => r.name || r.phone || r.id,
                    filter: "Text",
                    component: (r) => <InlineLink href={adminPath(`/user/${r.id}`)}>{r.name || r.phone || r.id}</InlineLink>,
                  },
                  audience: { name: ta("مخاطب"), value: (r) => audienceLabel(r.audience), filter: "Set" },
                  requests: { name: ta("درخواست"), value: (r) => r.requests, filter: "Number" },
                  features: { name: ta("قابلیت‌ها"), value: (r) => arr<string>(r.features).map(titleOf).join("، "), filter: "Text" },
                }}
              />
            </WithTitle>

            <WithTitle title={ta("پرمصرف‌ترین مجموعه‌ها")}>
              <Table
                toolbar={false}
                exportable
                name="AdminAiUsageOrgs"
                data={arr<Usage["topOrgs"][number]>(data.topOrgs).map((r) => ({ ...r, _id: r.id }))}
                renderer={{
                  name: {
                    name: ta("مجموعه"),
                    value: (r) => r.name || r.id,
                    filter: "Text",
                    component: (r) =>
                      ORG_PATH[r.kind] ? (
                        <InlineLink href={adminPath(`${ORG_PATH[r.kind]}/${r.id}`)}>{r.name || r.id}</InlineLink>
                      ) : (
                        <>{r.name || r.id}</>
                      ),
                  },
                  kind: { name: ta("نوع"), value: (r) => audienceLabel(r.kind), filter: "Set" },
                  requests: { name: ta("درخواست"), value: (r) => r.requests, filter: "Number" },
                  features: { name: ta("قابلیت‌ها"), value: (r) => arr<string>(r.features).map(titleOf).join("، "), filter: "Text" },
                }}
              />
            </WithTitle>
          </>
        )}
      </HandleLoading>
    </div>
  );
};

export default AdminAiUsageTab;
