"use client";
import { useState } from "react";
import Link from "@/Components/i18n/Link";
import { useSearchParams } from "next/navigation";
import useSWR from "swr";
import classes from "./AdminAuditLogPage.module.css";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import { adminPath } from "@/Components/helpers/adminPath";
import Loading from "../UI/Loading";
import ErrorMessage from "../UI/ErrorMessage";
import { adminAllGroups } from "../UI/adminMenu";
import { RoleBadge, displayPhone, faDateTime, num, roleLabels } from "../User/userShared";
import { ta } from "@/Components/Admin/i18n/adminText";

type AuditLog = {
  _id: string;
  actor: {
    _id: string;
    phone: string;
    username?: string;
    role: string;
    identity?: { givenName: string; lastName: string } | null;
  } | null;
  actorRole: string;
  action: string;
  target: string;
  targetId?: string;
  method: string;
  path: string;
  fields: string[];
  details?: Record<string, unknown>;
  ip?: string;
  createdAt: string;
};

type AuditActor = {
  _id: string;
  count: number;
  phone?: string;
  username?: string;
  givenName?: string;
  lastName?: string;
};

type AuditResponse = {
  items: AuditLog[];
  total: number;
  page: number;
  limit: number;
  actors: AuditActor[];
};

const actionLabels: Record<string, string> = {
  get create() {
  return ta("ایجاد");
},
  get update() {
  return ta("ویرایش");
},
  get delete() {
  return ta("حذف");
},
  get settings() {
  return ta("تغییر تنظیمات");
},
  get role() {
  return ta("تغییر نقش");
},
  get logout() {
  return ta("خروج اجباری");
},
  get sync() {
  return ta("همگام‌سازی");
},
  get migrate() {
  return ta("مهاجرت داده");
},
  get other() {
  return ta("سایر");
},
};

// "blog" -> "مقالات", "tamin/service" -> "سرویس‌ها", from the sidebar menu.
const targetTitles = new Map<string, string>();
for (const group of adminAllGroups)
  for (const item of group.items)
    if (!targetTitles.has(item.href)) targetTitles.set(item.href, item.title);
targetTitles.set("user", "کاربران");

// built once at load, so it holds the Persian source: translated when shown
const targetLabel = (target: string) => ta(targetTitles.get(target) || target);

const actorName = (actor: AuditLog["actor"]) =>
  !actor
    ? ta("کاربر حذف‌شده")
    : actor.identity
      ? `${actor.identity.givenName} ${actor.identity.lastName}`
      : actor.username || displayPhone(actor.phone);

const AdminAuditLogPage = () => {
  const searchParams = useSearchParams();
  const [actor, setActor] = useState(searchParams.get("actor") || "");
  const [action, setAction] = useState("");
  const [page, setPage] = useState(1);
  const targetId = searchParams.get("targetId") || "";

  const params = new URLSearchParams({
    page: String(page),
    limit: "50",
    ...(actor && { actor }),
    ...(action && { action }),
    ...(targetId && { targetId }),
  });
  const { data, error, isValidating } = useSWR<AuditResponse>(
    `${API}/admin/audit?${params}`,
    (url: string) => fetcher({ url }).then((res) => res.data.data),
    { keepPreviousData: true },
  );
  const pages = data ? Math.max(1, Math.ceil(data.total / data.limit)) : 1;

  return (
    <div className={classes.main}>
      <header className={classes.header}>
        <h1 className={classes.title}>{ta("لاگ عملیات ادمین‌ها")}</h1>
        <span className={classes.subtitle}>
          {ta("هر ایجاد، ویرایش، حذف و تغییر تنظیمات در پنل این‌جا ثبت می‌شود. مقدار فیلدها ذخیره نمی‌شود، فقط نام آن‌ها.")}
        </span>
      </header>

      <section className={classes.card}>
        <div className={classes.filters}>
          <label>
            <span>{ta("ادمین")}</span>
            <select
              value={actor}
              onChange={(e) => {
                setActor(e.target.value);
                setPage(1);
              }}
            >
              <option value="">{ta("همه")}</option>
              {data?.actors.map((a) => (
                <option key={a._id} value={a._id}>
                  {`${a.givenName ? `${a.givenName} ${a.lastName}` : a.username || displayPhone(a.phone)} (${num.format(a.count)})`}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>{ta("نوع عملیات")}</span>
            <select
              value={action}
              onChange={(e) => {
                setAction(e.target.value);
                setPage(1);
              }}
            >
              <option value="">{ta("همه")}</option>
              {Object.entries(actionLabels).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          {targetId && (
            <span className={classes.chip}>
              {ta("فقط رکورد ${1}", [targetId.slice(-6)])}
              <Link href={adminPath("/audit")}>×</Link>
            </span>
          )}
          {data && <span className={classes.total}>{ta("${1} مورد", [num.format(data.total)])}</span>}
        </div>

        {error && !data ? (
          <ErrorMessage message={error.message} />
        ) : !data ? (
          <Loading />
        ) : data.items.length === 0 ? (
          <p className={classes.empty}>{ta("هنوز عملیاتی ثبت نشده است.")}</p>
        ) : (
          <div className={`${classes.tableWrap} ${isValidating ? classes.stale : ""}`}>
            <table className={classes.table}>
              <thead>
                <tr>
                  <th>{ta("زمان")}</th>
                  <th>{ta("ادمین")}</th>
                  <th>{ta("عملیات")}</th>
                  <th>{ta("بخش")}</th>
                  <th>{ta("جزئیات")}</th>
                  <th>IP</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((log) => {
                  const canOpen =
                    log.targetId && log.action !== "delete" && targetTitles.has(log.target);
                  return (
                    <tr key={log._id}>
                      <td className={classes.muted}>{faDateTime.format(new Date(log.createdAt))}</td>
                      <td>
                        {log.actor ? (
                          <Link href={adminPath(`/user/${log.actor._id}`)} className={classes.actor}>
                            {actorName(log.actor)}
                          </Link>
                        ) : (
                          actorName(log.actor)
                        )}
                        <div>
                          <RoleBadge role={log.actorRole} />
                        </div>
                      </td>
                      <td>
                        <span className={`${classes.action} ${classes[`action_${log.action}`] || ""}`}>
                          {actionLabels[log.action] || log.action}
                        </span>
                      </td>
                      <td>
                        {canOpen ? (
                          <Link
                            href={adminPath(`/${log.target}/${log.targetId}`)}
                            className={classes.target}
                          >
                            {targetLabel(log.target)}
                          </Link>
                        ) : (
                          <span className={classes.targetPlain}>{targetLabel(log.target)}</span>
                        )}
                        {log.targetId && (
                          <span className={classes.targetId}>{log.targetId.slice(-6)}</span>
                        )}
                      </td>
                      <td className={classes.details}>
                        {log.action === "role" && typeof log.details?.role === "string"
                          ? ta("نقش جدید: ${1}", [roleLabels[log.details.role] || log.details.role])
                          : log.fields.length
                            ? (
                                // the record's field names as stored: technical, so shown as
                                // left-to-right code chips, not as prose
                                <span className={classes.fields}>
                                  <span>{ta("فیلدها:")}</span>
                                  {log.fields.slice(0, 6).map((f) => (
                                    <code key={f} dir="ltr" className={classes.field}>
                                      {f}
                                    </code>
                                  ))}
                                  {log.fields.length > 6 && <span>{ta("و ${1} مورد دیگر", [num.format(log.fields.length - 6)])}</span>}
                                </span>
                              )
                            : "—"}
                      </td>
                      <td className={classes.ip}>{log.ip || "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {data && data.total > data.limit && (
          <div className={classes.pagination}>
            <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              {ta("قبلی")}
            </button>
            <span>{ta("صفحه ${1} از ${2}", [num.format(page), num.format(pages)])}</span>
            <button type="button" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>
              {ta("بعدی")}
            </button>
          </div>
        )}
      </section>
    </div>
  );
};

export default AdminAuditLogPage;
