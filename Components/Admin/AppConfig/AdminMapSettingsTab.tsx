"use client";
import { TEHRAN_TZ } from "@/Components/helpers/tehranTime";

import { useState } from "react";
import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher, FetchError } from "@/Components/helpers/fetcher";
import useNotification from "@/Components/Hooks/useNotification";
import HandleLoading from "../UI/HandleLoading";
import WithTitle from "../UI/WithTitle";
import CreateForm from "../UI/CreateForm";
import Box from "../UI/Box";
import Button from "@/Components/UI/Button";
import Badge from "@/Components/UI/Badge";
import { adminIntlTag, ta } from "@/Components/Admin/i18n/adminText";
import AdminMapBatchGeocode from "./AdminMapBatchGeocode";
import AdminMapPlacesExport from "./AdminMapPlacesExport";
import classes from "./AdminMapSettings.module.css";

// «نقشه (نکسا مپ)» in the system settings (2026-10): the one map provider
// of the site (backend Lib/nexamap.ts). The key is write-only: the backend
// sends a masked preview and keeps the stored key unless a new one is typed
// (GET/POST /admin/map/settings, super admin only). Below the form: a
// status card (test call, this server's counters, the account's usage) and
// the batch geocode of providers that have an address but no map pin, and
// the places export for a NexaMap import (AdminMapPlacesExport).

type MapSettings = {
  nexamapEnabled: boolean;
  nexamapBaseUrl: string;
  nexamapDefaultStyle: string;
  nexamapDarkStyle: string;
  nexamapNavUrl?: string;
  apiKeySet: boolean;
  apiKeyPreview: string;
  apiKeyFromEnv: boolean;
  envBaseUrl?: boolean;
};

type MapSettingsInput = {
  nexamapEnabled: boolean;
  nexamapBaseUrl: string;
  nexamapApiKey: string;
  nexamapDefaultStyle: string;
  nexamapDarkStyle: string;
  nexamapNavUrl: string;
};

type MapStatus = {
  enabled: boolean;
  server: {
    limit?: number;
    remaining?: number;
    reset?: string;
    dataVersion?: string;
    lastCreditsUsed?: number;
    creditsSinceBoot?: number;
    callsSinceBoot?: number;
    errorsSinceBoot?: number;
    lastError?: { code: string; at: string };
  };
  account?: unknown;
  accountError?: { code: string; message: string } | null;
};

type TestResult = {
  ok: boolean;
  latencyMs?: number;
  baseUrl?: string;
  address?: string | null;
  dataVersion?: string | null;
  error?: { code: string; message: string };
};

const isRecord = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object" && !Array.isArray(v);

const formatNumber = (v: unknown) =>
  typeof v === "number" && Number.isFinite(v) ? v.toLocaleString(adminIntlTag()) : "—";

const formatDate = (v: unknown) => {
  if (typeof v !== "string" || !v) return "—";
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? v : d.toLocaleString(adminIntlTag(), { timeZone: TEHRAN_TZ });
};

const Stat = ({ label, value, ltr }: { label: string; value: string; ltr?: boolean }) => (
  <div className={classes.stat}>
    <dt>{label}</dt>
    <dd className={ltr ? classes.ltr : undefined}>{value}</dd>
  </div>
);

// The provider's /v1/usage answer: the documented fields first, then any
// other plain value it sends, then the last days by service.
const AccountUsage = ({ account }: { account: unknown }) => {
  if (!isRecord(account)) return <p className={classes.note}>{ta("اطلاعاتی از حساب دریافت نشد")}</p>;
  const known: Record<string, string> = {
    get plan() {
      return ta("طرح");
    },
    get quota_used() {
      return ta("مصرف‌شده");
    },
    get quota_remaining() {
      return ta("باقی‌مانده");
    },
  };
  const plain = Object.entries(account).filter(
    ([, v]) => typeof v === "string" || typeof v === "number" || typeof v === "boolean",
  );
  const daily = Array.isArray(account.daily) ? account.daily.filter(isRecord).slice(-10) : [];
  return (
    <div className={classes.stack}>
      <dl className={classes.stats}>
        {plain.map(([key, value]) => (
          <Stat
            key={key}
            label={key in known ? known[key] : key}
            value={typeof value === "number" ? formatNumber(value) : String(value)}
            ltr={typeof value !== "number" && !(key in known)}
          />
        ))}
      </dl>
      {!!daily.length && (
        <div className={classes.tableWrap}>
          <table className={classes.countsTable}>
            <thead>
              <tr>
                <th>{ta("تاریخ")}</th>
                <th>{ta("سرویس")}</th>
                <th>{ta("تعداد")}</th>
              </tr>
            </thead>
            <tbody>
              {daily.map((row, i) => (
                <tr key={i}>
                  <td className={classes.ltr}>{String(row.date ?? "—")}</td>
                  <td className={classes.ltr}>{String(row.service ?? "—")}</td>
                  <td>{formatNumber(row.count)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const MapStatusCard = ({ enabled }: { enabled: boolean }) => {
  const pushNotification = useNotification();
  const { data, error, mutate, isValidating } = useSWR<MapStatus>(
    `${API}/admin/map/status`,
    (url: string) => fetcher({ url }).then((res) => res.data),
    { refreshInterval: 30_000 },
  );
  const [testing, setTesting] = useState(false);
  const [test, setTest] = useState<TestResult | null>(null);

  const runTest = async () => {
    if (testing) return;
    setTesting(true);
    try {
      const res = await fetcher({ url: `${API}/admin/map/test`, method: "POST", payload: {}, bodyParser: "JSON" });
      setTest(isRecord(res?.data) ? (res.data as TestResult) : null);
      mutate();
    } catch (err) {
      if (err instanceof FetchError) pushNotification(err.message, "Error");
    } finally {
      setTesting(false);
    }
  };

  const server = isRecord(data?.server) ? data!.server : {};
  return (
    <Box className={classes.box}>
      <h3 className={classes.sectionTitle}>{ta("وضعیت سرویس نقشه")}</h3>
      <div className={classes.row}>
        <Badge color={enabled ? "Success" : "Disabled"} size="L">
          {enabled ? ta("فعال") : ta("غیرفعال")}
        </Badge>
        <span className={classes.note}>
          {ta("آزمایش اتصال، نشانی یک نقطه در مرکز تهران را با تنظیمات ذخیره‌شده از نکسا مپ می‌پرسد.")}
        </span>
      </div>
      <div className={classes.actions}>
        <Button size="M" onClick={runTest} isLoading={testing}>
          {ta("آزمایش اتصال")}
        </Button>
        <Button size="M" mode="Outline" variant="Neutral" onClick={() => mutate()} isLoading={isValidating}>
          {ta("به‌روزرسانی آمار")}
        </Button>
      </div>
      {!!test && (
        <div className={classes.row} aria-live="polite">
          <Badge color={test.ok ? "Success" : "Error"} size="L">
            {test.ok ? ta("اتصال برقرار است") : ta("اتصال ناموفق")}
          </Badge>
          {typeof test.latencyMs === "number" && (
            <span className={classes.note}>{ta("${1} میلی‌ثانیه", [formatNumber(test.latencyMs)])}</span>
          )}
          {test.ok && !!test.address && <span className={classes.note}>{test.address}</span>}
          {!test.ok && !!test.error && (
            <span className={classes.error}>
              {test.error.message} <span className={classes.ltr}>({test.error.code})</span>
            </span>
          )}
        </div>
      )}

      <h4 className={classes.sectionTitle}>{ta("مصرف این سرور (از آخرین راه‌اندازی)")}</h4>
      <HandleLoading data={!!data} error={error}>
        <dl className={classes.stats}>
          <Stat label={ta("تعداد درخواست‌ها")} value={formatNumber(server.callsSinceBoot)} />
          <Stat label={ta("خطاها")} value={formatNumber(server.errorsSinceBoot)} />
          <Stat label={ta("اعتبار مصرف‌شده")} value={formatNumber(server.creditsSinceBoot)} />
          <Stat
            label={ta("سهمیه‌ی باقی‌مانده / سقف")}
            value={`${formatNumber(server.remaining)} / ${formatNumber(server.limit)}`}
          />
          <Stat label={ta("تمدید سهمیه")} value={formatDate(server.reset)} />
          <Stat label={ta("نسخه‌ی داده‌ها")} value={server.dataVersion || "—"} ltr />
          <Stat
            label={ta("آخرین خطا")}
            value={server.lastError ? `${server.lastError.code} · ${formatDate(server.lastError.at)}` : "—"}
          />
        </dl>
      </HandleLoading>

      <h4 className={classes.sectionTitle}>{ta("مصرف حساب نکسا مپ")}</h4>
      {!data?.enabled ? (
        <p className={classes.note}>{ta("سرویس نقشه غیرفعال است یا کلید ندارد.")}</p>
      ) : data.accountError ? (
        <p className={classes.error}>
          {data.accountError.message} <span className={classes.ltr}>({data.accountError.code})</span>
        </p>
      ) : (
        <AccountUsage account={data.account} />
      )}
    </Box>
  );
};

const AdminMapSettingsTab = () => {
  const { data, error, mutate } = useSWR<MapSettings>(
    `${API}/admin/map/settings`,
    (url: string) => fetcher({ url }).then((res) => res.data),
  );

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <div className={classes.stack}>
          <WithTitle title={ta("نقشه (نکسا مپ)")}>
            <p className={classes.note}>
              {ta("همه‌ی نقشه‌ها، جست‌وجوی نشانی، مسیر و اطلاعات مکان سایت از نکسا مپ می‌آید. کلید فقط روی سرور می‌ماند و مرورگرها از طریق سرور سایت به نقشه وصل می‌شوند.")}
            </p>
            {data.apiKeyFromEnv && (
              <p className={classes.note}>
                {ta("کلیدی اینجا ذخیره نشده و کلید فایل ‎.env سرور استفاده می‌شود.")}
              </p>
            )}
            <CreateForm<MapSettingsInput>
              key={`${data.apiKeyPreview}|${data.nexamapBaseUrl}|${data.nexamapEnabled}|${data.nexamapNavUrl}`}
              layout="flat"
              defaultValue={{
                nexamapEnabled: !!data.nexamapEnabled,
                nexamapBaseUrl: data.nexamapBaseUrl || "",
                // write-only: an empty field keeps the stored key
                nexamapApiKey: "",
                nexamapDefaultStyle: data.nexamapDefaultStyle || "",
                nexamapDarkStyle: data.nexamapDarkStyle || "",
                nexamapNavUrl: data.nexamapNavUrl || "",
              }}
              hookProps={{
                path: `${API}/admin/map/settings`,
                method: "POST",
                parser: "JSON",
                successCb: () => mutate(),
              }}
              renderer={{
                nexamapEnabled: { title: ta("فعال بودن نقشه‌ی نکسا مپ"), type: "bool" },
                nexamapBaseUrl: { title: ta("آدرس سرویس (Base URL)"), type: "text", ltr: true },
                nexamapApiKey: {
                  title: data.apiKeySet
                    ? ta("کلید API (ذخیره‌شده: ${1}؛ برای تغییر، کلید جدید را وارد کنید)", [data.apiKeyPreview])
                    : ta("کلید API"),
                  type: "secret",
                },
                nexamapDefaultStyle: { title: ta("نام سبک نقشه برای تم روشن (روز)"), type: "text", ltr: true },
                nexamapDarkStyle: { title: ta("نام سبک نقشه برای تم تیره (شب)"), type: "text", ltr: true },
                // "Open in navigation" everywhere on the site goes here
                nexamapNavUrl: {
                  title: ta("لینک مسیریابی در سایت نکسا مپ (با {lat} و {lng}؛ خالی یعنی لینک پیش‌فرض nexamap.ir)"),
                  type: "text",
                  ltr: true,
                },
              }}
            />
          </WithTitle>
          <MapStatusCard enabled={!!data.nexamapEnabled && (data.apiKeySet || data.apiKeyFromEnv)} />
          <AdminMapBatchGeocode enabled={!!data.nexamapEnabled && (data.apiKeySet || data.apiKeyFromEnv)} />
          {/* the public places as a file for a NexaMap import */}
          <AdminMapPlacesExport />
        </div>
      )}
    </HandleLoading>
  );
};

export default AdminMapSettingsTab;
