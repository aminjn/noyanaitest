"use client";
import useSWR from "swr";
import Link from "@/Components/i18n/Link";
import classes from "./EntityOverview.module.css";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import { adminPath } from "@/Components/helpers/adminPath";
import HandleLoading from "./HandleLoading";

export type EntityKind =
  | "doctorprofile"
  | "clinic"
  | "hospital"
  | "pharmacy"
  | "paraClinic"
  | "insurance";

type Overview = {
  _id: string;
  name: string;
  active?: boolean;
  owner: { _id: string; phone?: string; username?: string } | null;
  rating: { average: number; count: number } | null;
  stats: { key: string; label: string; value: number }[];
  relations: {
    key: string;
    label: string;
    total: number;
    items: { _id: string; name: string; href: string }[];
  }[];
  pending: { key: string; label: string; count: number; href: string }[];
  license: {
    displayName: string;
    startedAt: string | null;
    expiresAt: string | null;
    isExpired: boolean;
  } | null;
  audit: {
    _id: string;
    action: string;
    fields: string[];
    createdAt: string;
    actor: string;
  }[];
};

const num = new Intl.NumberFormat("fa-IR");
const date = new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium" });
const dateTime = new Intl.DateTimeFormat("fa-IR", {
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const actionLabels: Record<string, string> = {
  create: "ایجاد",
  update: "ویرایش",
  delete: "حذف",
  settings: "تغییر تنظیمات",
  other: "سایر",
};

const displayPhone = (phone?: string) =>
  phone?.startsWith("98") ? `0${phone.slice(2)}` : phone || "";

const list = <T,>(value: unknown): T[] => (Array.isArray(value) ? value : []);

const formatDate = (value: string | null) => {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "—" : date.format(d);
};

// "Entity 360" tab: everything connected to one doctor / centre on one
// screen (owner, memberships, pending requests, licence, activity, admin
// history), each linked to where it's managed.
const EntityOverview = ({
  kind,
  nodeId,
}: {
  kind: EntityKind;
  nodeId: string;
}) => {
  const { data, error } = useSWR<Overview>(
    `${API}/admin/entity/${kind}/${nodeId}`,
    (url: string) => fetcher({ url }).then((res) => res.data.data),
  );

  const stats = list<Overview["stats"][number]>(data?.stats);
  const relations = list<Overview["relations"][number]>(data?.relations);
  const pending = list<Overview["pending"][number]>(data?.pending);
  const audit = list<Overview["audit"][number]>(data?.audit);

  return (
    <HandleLoading data={!!data} error={error}>
      {data && (
        <div className={classes.main}>
          <div className={classes.chips}>
            {typeof data.active === "boolean" && (
              <span className={data.active ? classes.ok : classes.off}>
                {data.active ? "فعال" : "غیرفعال"}
              </span>
            )}
            {data.owner ? (
              <Link
                href={adminPath(`/user/${data.owner._id}`)}
                className={classes.chip}
              >
                {`حساب کاربری: ${displayPhone(data.owner.phone) || data.owner.username || "—"}`}
              </Link>
            ) : (
              <span className={classes.off}>بدون حساب کاربری</span>
            )}
            {data.rating && data.rating.count > 0 && (
              <span className={classes.chip}>
                {`امتیاز ${num.format(Math.round(data.rating.average * 10) / 10)} از ${num.format(data.rating.count)} نظر`}
              </span>
            )}
          </div>

          {pending.length > 0 && (
            <div className={classes.pending}>
              {pending.map((item) => (
                <Link
                  key={item.key}
                  href={adminPath(`/${item.href}`)}
                  className={classes.pendingItem}
                >
                  <strong>{num.format(item.count)}</strong>
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          )}

          {stats.length > 0 && (
            <div className={classes.stats}>
              {stats.map((stat) => (
                <div key={stat.key} className={classes.stat}>
                  <strong>{num.format(stat.value || 0)}</strong>
                  <span>{stat.label}</span>
                </div>
              ))}
            </div>
          )}

          <div className={classes.grid}>
            {relations.map((rel) => (
              <section key={rel.key} className={classes.card}>
                <h3 className={classes.cardTitle}>
                  {rel.label}
                  <span className={classes.count}>{num.format(rel.total)}</span>
                </h3>
                {rel.items.length === 0 ? (
                  <p className={classes.empty}>موردی ثبت نشده است</p>
                ) : (
                  <div className={classes.links}>
                    {list<Overview["relations"][number]["items"][number]>(
                      rel.items,
                    ).map((item) => (
                      <Link
                        key={item._id}
                        href={adminPath(`/${item.href}`)}
                        className={classes.link}
                      >
                        {item.name}
                      </Link>
                    ))}
                    {rel.total > rel.items.length && (
                      <span className={classes.more}>
                        {`و ${num.format(rel.total - rel.items.length)} مورد دیگر`}
                      </span>
                    )}
                  </div>
                )}
              </section>
            ))}

            <section className={classes.card}>
              <h3 className={classes.cardTitle}>اشتراک</h3>
              {data.license ? (
                <dl className={classes.license}>
                  <dt>پلن</dt>
                  <dd>{data.license.displayName || "—"}</dd>
                  <dt>شروع</dt>
                  <dd>{formatDate(data.license.startedAt)}</dd>
                  <dt>پایان</dt>
                  <dd className={data.license.isExpired ? classes.expired : ""}>
                    {formatDate(data.license.expiresAt)}
                    {data.license.isExpired && " (منقضی شده)"}
                  </dd>
                </dl>
              ) : (
                <p className={classes.empty}>اشتراکی ثبت نشده است</p>
              )}
            </section>

            <section className={`${classes.card} ${classes.wide}`}>
              <h3 className={classes.cardTitle}>آخرین تغییرات ادمین</h3>
              {audit.length === 0 ? (
                <p className={classes.empty}>تغییری ثبت نشده است</p>
              ) : (
                <ul className={classes.audit}>
                  {audit.map((row) => (
                    <li key={row._id}>
                      <span className={classes.action}>
                        {actionLabels[row.action] || row.action}
                      </span>
                      <span className={classes.fields}>
                        {list<string>(row.fields).slice(0, 4).join("، ")}
                      </span>
                      <span className={classes.actor}>
                        {displayPhone(row.actor)}
                      </span>
                      <span className={classes.when}>
                        {row.createdAt
                          ? dateTime.format(new Date(row.createdAt))
                          : ""}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              <Link href={adminPath("/audit")} className={classes.more}>
                لاگ کامل عملیات
              </Link>
            </section>
          </div>
        </div>
      )}
    </HandleLoading>
  );
};

export default EntityOverview;
