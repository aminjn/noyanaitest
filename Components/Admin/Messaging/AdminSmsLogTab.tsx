"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import { adminNumberFormat, ta } from "@/Components/Admin/i18n/adminText";
import Button from "@/Components/UI/Button";
import HandleLoading from "../UI/HandleLoading";
import WithTitle from "../UI/WithTitle";
import Table from "../UI/Table";
import { displayPhone } from "../User/userShared";
import classes from "../Support/support.module.css";

// SMS send log (2026-10 audit, P3-17): every attempt with its pattern and
// result, so support can answer "I never got the code" without the
// gateway's own panel. Message variables (the OTP itself) are never stored.
// Rows expire after 90 days. Backend: GET /admin/support/sms-log (super admin).

type SmsStatus = "sent" | "failed" | "skipped";

type SmsLogRow = {
  _id: string;
  to: string;
  pattern: string;
  code?: string;
  locale?: string;
  status: SmsStatus;
  error?: string;
  outboxId?: string;
  at: string;
};

type SmsLogResponse = {
  items: SmsLogRow[];
  total: number;
  page: number;
  limit: number;
  last24h: { sent: number; failed: number; skipped: number; otpSent: number; otpFailed: number };
  patterns: string[];
};

const statusDict: Record<SmsStatus, string> = {
  get sent() {
    return ta("ارسال شد");
  },
  get failed() {
    return ta("ناموفق");
  },
  get skipped() {
    return ta("ارسال نشد (بدون پترن یا محیط آزمایشی)");
  },
};

const PAGE_SIZE = 50;
const num = adminNumberFormat();

const AdminSmsLogTab = () => {
  const [status, setStatus] = useState<"" | SmsStatus>("");
  const [otpOnly, setOtpOnly] = useState(false);
  const [pattern, setPattern] = useState("");
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => {
      setQuery(search.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const params = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE) });
  if (status) params.set("status", status);
  if (otpOnly) params.set("otp", "1");
  else if (pattern) params.set("pattern", pattern);
  if (query) params.set("q", query);

  const { data, error } = useSWR<SmsLogResponse>(
    `${API}/admin/support/sms-log?${params}`,
    (url: string) => fetcher({ url }).then((res) => res.data.data),
    { keepPreviousData: true, refreshInterval: 30_000 },
  );
  const items = Array.isArray(data?.items) ? data.items : [];
  const patterns = Array.isArray(data?.patterns) ? data.patterns : [];
  const pages = data ? Math.max(1, Math.ceil(data.total / (data.limit || PAGE_SIZE))) : 1;
  const s = data?.last24h;

  // one click to "failed OTPs", the support question this log is for
  const showOtpFailures = () => {
    setOtpOnly(true);
    setStatus("failed");
    setPage(1);
  };

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle title={ta("گزارش ارسال پیامک")}>
          <div className={classes.stack}>
            {s && (
              <div className={classes.summary}>
                <div className={classes.stat}>
                  <span className={classes.statValue}>{num.format(s.sent || 0)}</span>
                  <span className={classes.statLabel}>{ta("ارسال‌شده در ۲۴ ساعت گذشته")}</span>
                </div>
                <div className={`${classes.stat} ${s.failed ? classes.statBad : ""}`}>
                  <span className={classes.statValue}>{num.format(s.failed || 0)}</span>
                  <span className={classes.statLabel}>{ta("ناموفق در ۲۴ ساعت گذشته")}</span>
                </div>
                <div className={classes.stat}>
                  <span className={classes.statValue}>{num.format(s.otpSent || 0)}</span>
                  <span className={classes.statLabel}>{ta("کد ورود ارسال‌شده")}</span>
                </div>
                <div className={`${classes.stat} ${s.otpFailed ? classes.statBad : ""}`}>
                  <span className={classes.statValue}>{num.format(s.otpFailed || 0)}</span>
                  <span className={classes.statLabel}>{ta("کد ورود ناموفق")}</span>
                </div>
              </div>
            )}
            <div className={classes.toolbar}>
              <input
                className={classes.search}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={ta("جستجو با شماره موبایل...")}
              />
              <select
                className={classes.select}
                aria-label={ta("وضعیت")}
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value as SmsStatus | "");
                  setPage(1);
                }}
              >
                <option value="">{ta("همه‌ی وضعیت‌ها")}</option>
                {(Object.keys(statusDict) as SmsStatus[]).map((k) => (
                  <option key={k} value={k}>
                    {statusDict[k]}
                  </option>
                ))}
              </select>
              <select
                className={classes.select}
                aria-label={ta("پترن")}
                value={otpOnly ? "OTP_PATTERN" : pattern}
                onChange={(e) => {
                  setOtpOnly(e.target.value === "OTP_PATTERN");
                  setPattern(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">{ta("همه‌ی پترن‌ها")}</option>
                {Array.from(new Set(["OTP_PATTERN", ...patterns])).map((p) => (
                  <option key={p} value={p}>
                    {p === "OTP_PATTERN" ? ta("کد ورود (OTP)") : p}
                  </option>
                ))}
              </select>
              <Button size="M" variant="Neutral" onClick={showOtpFailures}>
                {ta("کدهای ورود ناموفق")}
              </Button>
            </div>
            <Table
              data={items}
              name="AdminSmsLog"
              renderer={{
                to: {
                  name: ta("گیرنده"),
                  value: (node) => displayPhone(node.to),
                  component: (node) => <span dir="ltr">{displayPhone(node.to)}</span>,
                },
                pattern: {
                  name: ta("پترن"),
                  value: (node) => (node.pattern === "OTP_PATTERN" ? ta("کد ورود (OTP)") : node.pattern),
                },
                status: {
                  name: ta("وضعیت"),
                  value: (node) => statusDict[node.status] || node.status,
                  component: (node) => (
                    <span
                      className={`${classes.pill} ${
                        node.status === "failed"
                          ? classes.overdue
                          : node.status === "sent"
                            ? classes.waitUser
                            : ""
                      }`}
                    >
                      {statusDict[node.status] || node.status}
                    </span>
                  ),
                },
                error: {
                  name: ta("خطای درگاه"),
                  value: (node) => node.error || "",
                },
                code: {
                  name: ta("کد پترن"),
                  value: (node) => node.code || "",
                },
                locale: {
                  name: ta("زبان"),
                  value: (node) => node.locale || "",
                },
                outboxId: {
                  name: ta("شناسه‌ی ارسال"),
                  value: (node) => node.outboxId || "",
                },
                at: {
                  name: ta("زمان"),
                  value: (node) => new Date(node.at),
                },
              }}
            />
            {pages > 1 && (
              <div className={classes.pager}>
                <Button
                  size="S"
                  variant={page <= 1 ? "Disable" : "Neutral"}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  {ta("قبلی")}
                </Button>
                <span>{ta("صفحه‌ی ${1} از ${2}", [num.format(page), num.format(pages)])}</span>
                <Button
                  size="S"
                  variant={page >= pages ? "Disable" : "Neutral"}
                  onClick={() => setPage((p) => Math.min(pages, p + 1))}
                >
                  {ta("بعدی")}
                </Button>
              </div>
            )}
          </div>
        </WithTitle>
      )}
    </HandleLoading>
  );
};

export default AdminSmsLogTab;
