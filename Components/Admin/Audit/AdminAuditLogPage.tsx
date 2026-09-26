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
import { adminMenu } from "../UI/adminMenu";
import { RoleBadge, displayPhone, faDateTime, num, roleLabels } from "../User/userShared";

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
  create: "ایجاد",
  update: "ویرایش",
  delete: "حذف",
  settings: "تغییر تنظیمات",
  role: "تغییر نقش",
  logout: "خروج اجباری",
  sync: "همگام‌سازی",
  migrate: "مهاجرت داده",
  other: "سایر",
};

// "blog" -> "مقالات", "tamin/service" -> "سرویس‌ها", from the sidebar menu.
const targetTitles = new Map<string, string>();
for (const group of adminMenu)
  for (const item of group.items)
    if (!targetTitles.has(item.href)) targetTitles.set(item.href, item.title);
targetTitles.set("user", "کاربران");

const targetLabel = (target: string) => targetTitles.get(target) || target;

const actorName = (actor: AuditLog["actor"]) =>
  !actor
    ? "کاربر حذف‌شده"
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
        <h1 className={classes.title}>لاگ عملیات ادمین‌ها</h1>
        <span className={classes.subtitle}>
          هر ایجاد، ویرایش، حذف و تغییر تنظیمات در پنل این‌جا ثبت می‌شود. مقدار فیلدها ذخیره
          نمی‌شود، فقط نام آن‌ها.
        </span>
      </header>

      <section className={classes.card}>
        <div className={classes.filters}>
          <label>
            <span>ادمین</span>
            <select
              value={actor}
              onChange={(e) => {
                setActor(e.target.value);
                setPage(1);
              }}
            >
              <option value="">همه</option>
              {data?.actors.map((a) => (
                <option key={a._id} value={a._id}>
                  {`${a.givenName ? `${a.givenName} ${a.lastName}` : a.username || displayPhone(a.phone)} (${num.format(a.count)})`}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>نوع عملیات</span>
            <select
              value={action}
              onChange={(e) => {
                setAction(e.target.value);
                setPage(1);
              }}
            >
              <option value="">همه</option>
              {Object.entries(actionLabels).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          {targetId && (
            <span className={classes.chip}>
              {`فقط رکورد ${targetId.slice(-6)}`}
              <Link href={adminPath("/audit")}>×</Link>
            </span>
          )}
          {data && <span className={classes.total}>{`${num.format(data.total)} مورد`}</span>}
        </div>

        {error && !data ? (
          <ErrorMessage message={error.message} />
        ) : !data ? (
          <Loading />
        ) : data.items.length === 0 ? (
          <p className={classes.empty}>هنوز عملیاتی ثبت نشده است.</p>
        ) : (
          <div className={`${classes.tableWrap} ${isValidating ? classes.stale : ""}`}>
            <table className={classes.table}>
              <thead>
                <tr>
                  <th>زمان</th>
                  <th>ادمین</th>
                  <th>عملیات</th>
                  <th>بخش</th>
                  <th>جزئیات</th>
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
                          ? `نقش جدید: ${roleLabels[log.details.role] || log.details.role}`
                          : log.fields.length
                            ? `فیلدها: ${log.fields.slice(0, 6).join("، ")}${log.fields.length > 6 ? ` و ${num.format(log.fields.length - 6)} مورد دیگر` : ""}`
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
              قبلی
            </button>
            <span>{`صفحه ${num.format(page)} از ${num.format(pages)}`}</span>
            <button type="button" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>
              بعدی
            </button>
          </div>
        )}
      </section>
    </div>
  );
};

export default AdminAuditLogPage;
