"use client";

import { useState } from "react";
import useSWR from "swr";
import Link from "@/Components/i18n/Link";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import { adminPath } from "@/Components/helpers/adminPath";
import { adminIntlTag, ta } from "@/Components/Admin/i18n/adminText";
import DateInput from "@/Components/UI/DateInput";
import { isoDay } from "@/Components/_Common/Business/bizShared";
import Table from "../UI/Table";
import HandleLoading from "../UI/HandleLoading";
import { FinancePager } from "../Finance/FinanceListControls";
import classes from "./AdminAuditLogPage.module.css";

// The record-linking consent log (2026-10, backend Models/BizConsentLog.ts):
// every offer of a centre's CRM contact to a Noyan user, and the patient's
// «وصل شود», «این من نیستم», «بعداً» and unlink, with IP, user agent and the
// matched phone (masked). Append-only: read here, never changed. Shown as a
// tab of «لاگ عملیات» and, filtered to one user, on the user's page.

type ConsentRow = {
  _id: string;
  at: string;
  action: "offered" | "linked" | "declined" | "dismissed-later" | "unlinked" | "withdrawn";
  actor: "patient" | "system";
  source: "manual" | "csv" | "webform" | "visit";
  reason?: string;
  ownerKind: string;
  ownerId: string;
  ownerName: string;
  contact: string;
  phone: string;
  ip?: string;
  userAgent?: string;
  user: { _id: string; username?: string; name?: string } | null;
};
type ConsentPage = { items: ConsentRow[]; total: number; page: number; limit: number };

const actionLabels: Record<ConsentRow["action"], string> = {
  get offered() {
    return ta("پیشنهاد اتصال");
  },
  get linked() {
    return ta("وصل شد");
  },
  get declined() {
    return ta("«این من نیستم»");
  },
  get "dismissed-later"() {
    return ta("«بعداً»");
  },
  get unlinked() {
    return ta("اتصال برداشته شد");
  },
  get withdrawn() {
    return ta("پیشنهاد منقضی شد");
  },
};
const sourceLabels: Record<ConsentRow["source"], string> = {
  get manual() {
    return ta("ثبت دستی مرکز");
  },
  get csv() {
    return ta("فایل CSV مرکز");
  },
  get webform() {
    return ta("فرم سایت مرکز");
  },
  get visit() {
    return ta("نوبت یا خرید در نویان");
  },
};
const kindLabels: Record<string, string> = {
  get doctor() {
    return ta("پزشک");
  },
  get clinic() {
    return ta("کلینیک");
  },
  get hospital() {
    return ta("بیمارستان");
  },
  get pharmacy() {
    return ta("داروخانه");
  },
  get paraClinic() {
    return ta("پاراکلینیک");
  },
  get insurance() {
    return ta("بیمه");
  },
};
const reasonLabels: Record<string, string> = {
  get phoneChanged() {
    return ta("شماره‌ی کاربر عوض شد");
  },
  get contactGone() {
    return ta("پرونده حذف شد");
  },
  get linkedElsewhere() {
    return ta("به حساب دیگری وصل شد");
  },
};

const LIMIT = 50;

const AdminConsentLog = ({ user }: { user?: string }) => {
  const [action, setAction] = useState("");
  const [source, setSource] = useState("");
  const [ownerKind, setOwnerKind] = useState("");
  const [phone, setPhone] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);
  const params = new URLSearchParams({
    page: String(page),
    limit: String(LIMIT),
    ...(user ? { user } : {}),
    ...(action ? { action } : {}),
    ...(source ? { source } : {}),
    ...(ownerKind ? { ownerKind } : {}),
    ...(/^[0-9۰-۹+]{10,14}$/.test(phone.trim()) ? { phone: phone.trim() } : {}),
    ...(from ? { from } : {}),
    ...(to ? { to } : {}),
  });
  const { data, error, isValidating } = useSWR<ConsentPage>(
    `${API}/admin/consent-log?${params}`,
    (url: string) =>
      fetcher({ url }).then((res) => {
        const body = res?.data?.data || {};
        return {
          items: Array.isArray(body.items) ? body.items : [],
          total: Number(body.total) || 0,
          page: Number(body.page) || page,
          limit: Number(body.limit) || LIMIT,
        };
      }),
    { keepPreviousData: true },
  );
  const fmt = new Intl.DateTimeFormat(adminIntlTag(), { dateStyle: "medium", timeStyle: "short" });
  const when = (v?: string) => {
    const d = v ? new Date(v) : null;
    return d && !Number.isNaN(d.getTime()) ? fmt.format(d) : "—";
  };
  const reset = <T,>(set: (v: T) => void) => (v: T) => {
    set(v);
    setPage(1);
  };
  const select = (title: string, value: string, set: (v: string) => void, options: Record<string, string>) => (
    <label>
      <span>{title}</span>
      <select value={value} onChange={(e) => reset(set)(e.target.value)}>
        <option value="">{ta("همه")}</option>
        {Object.entries(options).map(([k, v]) => (
          <option key={k} value={k}>
            {v}
          </option>
        ))}
      </select>
    </label>
  );

  return (
    <div className={classes.card}>
      <p className={classes.subtitle}>
        {ta("هر پیشنهاد اتصال پرونده‌ی مرکز به حساب نویان و پاسخ بیمار (وصل، «این من نیستم»، «بعداً»، برداشتن اتصال) با زمان، IP و شماره‌ی تطبیق‌داده‌شده این‌جا ثبت می‌شود. این لاگ فقط افزودنی است و ویرایش یا حذف نمی‌شود.")}
      </p>
      <div className={classes.filters}>
        {select(ta("رویداد"), action, setAction, actionLabels)}
        {select(ta("منبع"), source, setSource, sourceLabels)}
        {select(ta("نوع مرکز"), ownerKind, setOwnerKind, kindLabels)}
        <label>
          <span>{ta("شماره‌ی موبایل")}</span>
          <input dir="ltr" inputMode="tel" value={phone} onChange={(e) => reset(setPhone)(e.target.value)} placeholder="09…" />
        </label>
        <div className={classes.dateFilter}>
          <DateInput title={ta("از تاریخ")} onChange={(d) => reset(setFrom)(isoDay(d))} />
        </div>
        <div className={classes.dateFilter}>
          <DateInput title={ta("تا تاریخ")} onChange={(d) => reset(setTo)(isoDay(d))} />
        </div>
      </div>
      <HandleLoading data={!!data} error={error}>
        {!!data && (
          <>
            <Table
              name={user ? "AdminUserConsentLog" : "AdminConsentLog"}
              data={data.items}
              renderer={{
                at: { name: ta("زمان"), value: (n) => when(n.at) },
                ...(user
                  ? {}
                  : {
                      user: {
                        name: ta("کاربر"),
                        value: (n: ConsentRow) => n.user?.name || n.user?.username || n.user?._id?.slice(-6) || "—",
                        component: (n: ConsentRow) =>
                          n.user ? (
                            <Link href={adminPath(`/user/${n.user._id}`)}>{n.user.name || n.user.username || n.user._id.slice(-6)}</Link>
                          ) : (
                            "—"
                          ),
                      },
                    }),
                centre: {
                  name: ta("مرکز"),
                  value: (n) => `${n.ownerName || "—"} (${kindLabels[n.ownerKind] || n.ownerKind})`,
                },
                action: {
                  name: ta("رویداد"),
                  value: (n) =>
                    `${actionLabels[n.action] || n.action}${n.reason ? ` · ${reasonLabels[n.reason] || n.reason}` : ""}`,
                },
                actor: { name: ta("انجام‌دهنده"), value: (n) => (n.actor === "patient" ? ta("بیمار") : ta("سیستم")) },
                source: { name: ta("منبع"), value: (n) => sourceLabels[n.source] || n.source },
                phone: { name: ta("شماره‌ی تطبیق"), value: (n) => n.phone || "—", component: (n) => <bdi dir="ltr">{n.phone || "—"}</bdi> },
                ip: { name: "IP", value: (n) => n.ip || "—", component: (n) => <bdi dir="ltr">{n.ip || "—"}</bdi> },
                userAgent: { name: ta("مرورگر"), value: (n) => n.userAgent || "—" },
              }}
            />
            <FinancePager total={data.total} page={page} limit={data.limit} setPage={setPage} stale={isValidating} />
          </>
        )}
      </HandleLoading>
    </div>
  );
};

export default AdminConsentLog;
