"use client";
import Link from "@/Components/i18n/Link";
import useSWR from "swr";
import classes from "./AdminDashboardPage.module.css";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import { adminPath } from "@/Components/helpers/adminPath";
import useUser from "@/Components/Hooks/useUser";
import HandleLoading from "../UI/HandleLoading";
import Ixon from "@/Components/UI/Ixon";
import UserGroupIcon from "@/Components/Icons/UserGroupIcon";
import CalendarIcon from "@/Components/Icons/CalendarIcon";
import ShoppingCartIcon from "@/Components/Icons/ShoppingCartIcon";
import WalletIcon from "@/Components/Icons/WalletIcon";
import CheckCircleIcon from "@/Components/Icons/CheckCircleIcon";
import RetryIcon from "@/Components/Icons/RetryIcon";
import ChevronIcon from "@/Components/Icons/ChevronIcon";
import DailyBarChart from "@/Components/UI/DailyBarChart";
import { adminDateTimeFormat, adminIntlTag, adminIsRtl, adminNumberFormat, ta } from "@/Components/Admin/i18n/adminText";

type DailyPoint = { date: string; count: number };

// The admin panel is Persian-only.
const AdminDailyChart = ({
  title,
  unit,
  points,
}: {
  title: string;
  unit: string;
  points: DailyPoint[];
}) => {
  const list = Array.isArray(points) ? points : [];
  const total = list.reduce((sum, p) => sum + (p?.count || 0), 0);
  return (
    <DailyBarChart
      title={title}
      locale={adminIntlTag()}
      rtl={adminIsRtl()}
      points={list.map((p) => ({ date: p.date, value: p.count }))}
      formatValue={(value) => `${num.format(value)} ${unit}`}
      labels={{
        summary: ta("${1} ${2} در ${3} روز اخیر", [num.format(total), unit, num.format(list.length)]),
        chart: ta("نمودار"),
        table: ta("جدول"),
        day: ta("روز"),
        value: unit,
      }}
    />
  );
};

type Dashboard = {
  generatedAt: string;
  periodDays: number;
  totals: {
    users: number;
    newUsers: number;
    doctors: number;
    clinics: number;
    hospitals: number;
    pharmacies: number;
    paraClinics: number;
    insurances: number;
  };
  pending: { key: string; title: string; href?: string; count: number }[];
  // refunded: what came back to buyers of those orders (cancelled lines)
  orders: { paidCount: number; paidTotal: number; refunded?: number };
  // the platform's commission on provider payouts in the period
  commissionTotal?: number;
  reservations: {
    total: number;
    byStatus: Record<string, number>;
    completedTotal: number;
  };
  series: { signups: DailyPoint[]; reservations: DailyPoint[] };
  recentUsers: {
    _id: string;
    phone: string;
    username?: string;
    role: string;
    createdAt: string;
  }[];
};

const num = adminNumberFormat();
const dateTime = adminDateTimeFormat({
  month: "long",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});
const shortDate = adminDateTimeFormat({
  year: "numeric",
  month: "short",
  day: "numeric",
});

const roleLabels: Record<string, string> = {
  get admin() {
  return ta("سوپر ادمین");
},
  get notadmin() {
  return ta("کارمند");
},
  get user() {
  return ta("کاربر");
},
};

// Persian source, translated where shown (a module-level ta() would run
// before the panel's dictionary is set)
const reservationStatusLabels: [string, string][] = [
  ["pending", "در انتظار"],
  ["active", "فعال"],
  ["completed", "انجام‌شده"],
  ["cancelled", "لغوشده"],
  ["noShow", "عدم حضور"],
  ["error", "خطا"],
];

// 09123456789 instead of 989123456789
const displayPhone = (phone: string) =>
  phone?.startsWith("98") ? `0${phone.slice(2)}` : phone;

const StatTile = ({
  icon,
  tone = "indigo",
  label,
  value,
  note,
}: {
  icon: React.ReactNode;
  // glass tile tone (globals.css .tone-*)
  tone?: "indigo" | "violet" | "teal" | "amber" | "rose" | "sky";
  label: string;
  value: string;
  note?: string;
}) => (
  <div className={classes.tile}>
    <div className={classes.tileHead}>
      <span className={`${classes.tileIcon} glassIcon tone-${tone}`}>
        <Ixon width="1.125rem">{icon}</Ixon>
      </span>
      <span className={classes.tileLabel}>{label}</span>
    </div>
    <span className={classes.tileValue}>{value}</span>
    {note && <span className={classes.tileNote}>{note}</span>}
  </div>
);

const Card = ({
  title,
  action,
  children,
  className = "",
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) => (
  <section className={`${classes.card} ${className}`}>
    <div className={classes.cardHead}>
      <h2 className={classes.cardTitle}>{title}</h2>
      {action}
    </div>
    {children}
  </section>
);

const AdminDashboard = () => {
  const { data, error, mutate, isValidating } = useSWR<Dashboard>(
    `${API}/admin/dashboard`,
    (url: string) => fetcher({ url }).then((res) => res.data.data),
  );

  return (
    <HandleLoading data={!!data} error={error}>
      {data && (
        <div className={classes.main}>
          <header className={classes.header}>
            <div>
              <h1 className={classes.pageTitle}>{ta("داشبورد")}</h1>
              <span className={classes.updated}>
                {ta("به‌روزرسانی: ${1}", [dateTime.format(new Date(data.generatedAt))])}
              </span>
            </div>
            <button
              type="button"
              className={classes.refresh}
              onClick={() => mutate()}
              disabled={isValidating}
            >
              <Ixon width="1rem">
                <RetryIcon />
              </Ixon>
              <span>{isValidating ? ta("در حال بارگذاری...") : ta("به‌روزرسانی")}</span>
            </button>
          </header>

          <div className={classes.tiles}>
            <StatTile
              icon={<UserGroupIcon />}
              label={ta("کاربران")}
              value={num.format(data.totals.users)}
              note={ta("${1} کاربر جدید در ${2} روز اخیر", [num.format(data.totals.newUsers), num.format(data.periodDays)])}
            />
            <StatTile
              icon={<CalendarIcon />}
              tone="sky"
              label={ta("رزروها (${1} روز)", [num.format(data.periodDays)])}
              value={num.format(data.reservations.total)}
              note={ta("${1} نوبت انجام‌شده", [num.format(data.reservations.byStatus.completed || 0)])}
            />
            <StatTile
              icon={<ShoppingCartIcon />}
              tone="teal"
              label={ta("فروش سفارش‌ها (${1} روز)", [num.format(data.periodDays)])}
              value={ta("${1} تومان", [
                num.format(Math.max(0, (data.orders.paidTotal || 0) - (data.orders.refunded || 0))),
              ])}
              note={
                data.orders.refunded
                  ? ta("${1} سفارش پرداخت‌شده؛ ${2} تومان بازپرداخت کسر شده", [
                      num.format(data.orders.paidCount),
                      num.format(data.orders.refunded),
                    ])
                  : ta("${1} سفارش پرداخت‌شده", [num.format(data.orders.paidCount)])
              }
            />
            <StatTile
              icon={<CalendarIcon />}
              tone="violet"
              label={ta("ارزش نوبت‌های انجام‌شده (${1} روز)", [num.format(data.periodDays)])}
              value={ta("${1} تومان", [num.format(data.reservations.completedTotal)])}
              note={ta("مبلغی که بیماران پرداخته‌اند، با مالیات")}
            />
            <StatTile
              icon={<WalletIcon />}
              tone="amber"
              label={ta("درآمد کمیسیون (${1} روز)", [num.format(data.periodDays)])}
              value={ta("${1} تومان", [num.format(data.commissionTotal || 0)])}
              note={ta("سهم نویان از تسویه‌ی نوبت‌ها و سفارش‌ها")}
            />
          </div>

          <div className={classes.row}>
            <Card
              title={ta("کارهای در انتظار")}
              className={classes.pendingCard}
              action={
                data.pending.length > 0 && (
                  <Link href={adminPath("/inbox")} className={classes.inboxLink}>
                    <span>{ta("صندوق درخواست‌ها")}</span>
                    <span className={classes.badge}>
                      {num.format(data.pending.reduce((s, p) => s + p.count, 0))}
                    </span>
                  </Link>
                )
              }
            >
              {data.pending.length === 0 ? (
                <div className={classes.allClear}>
                  <Ixon width="1.5rem">
                    <CheckCircleIcon />
                  </Ixon>
                  <span>{ta("کار معوقه‌ای وجود ندارد")}</span>
                </div>
              ) : (
                <ul className={classes.pendingList}>
                  {data.pending.map((item) => {
                    const content = (
                      <>
                        <span className={classes.pendingTitle}>{ta(item.title)}</span>
                        <span className={classes.pendingCount}>
                          {num.format(item.count)}
                        </span>
                        {item.href && (
                          <Ixon width="0.9rem" className={classes.pendingArrow}>
                            <ChevronIcon />
                          </Ixon>
                        )}
                      </>
                    );
                    return (
                      <li key={item.key}>
                        {item.href ? (
                          <Link
                            href={adminPath(`/${item.href}`)}
                            className={classes.pendingItem}
                          >
                            {content}
                          </Link>
                        ) : (
                          <div className={classes.pendingItem}>{content}</div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </Card>

            <Card title={ta("مراکز و ارائه‌دهندگان")}>
              <div className={classes.entityGrid}>
                {(
                  [
                    [ta("پزشکان"), data.totals.doctors, "doctorprofile"],
                    [ta("کلینیک‌ها"), data.totals.clinics, "clinic"],
                    [ta("بیمارستان‌ها"), data.totals.hospitals, "hospital"],
                    [ta("داروخانه‌ها"), data.totals.pharmacies, "pharmacy"],
                    [ta("پاراکلینیک‌ها"), data.totals.paraClinics, "paraClinic"],
                    [ta("بیمه‌ها"), data.totals.insurances, "insurance"],
                  ] as [string, number, string][]
                ).map(([label, value, href]) => (
                  <Link key={href} href={adminPath(`/${href}`)} className={classes.entity}>
                    <span className={classes.entityValue}>{num.format(value)}</span>
                    <span className={classes.entityLabel}>{label}</span>
                  </Link>
                ))}
              </div>
              <div className={classes.statusBlock}>
                <span className={classes.statusTitle}>
                  {ta("وضعیت رزروهای ${1} روز اخیر", [num.format(data.periodDays)])}
                </span>
                <div className={classes.statusList}>
                  {reservationStatusLabels.map(([key, label]) => (
                    <span key={key} className={classes.statusChip}>
                      <span>{ta(label)}</span>
                      <strong>{num.format(data.reservations.byStatus[key] || 0)}</strong>
                    </span>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          <div className={classes.charts}>
            <section className={classes.card}>
              <AdminDailyChart
                title={ta("ثبت‌نام روزانه")}
                unit={ta("ثبت‌نام")}
                points={data.series.signups}
              />
            </section>
            <section className={classes.card}>
              <AdminDailyChart
                title={ta("رزرو روزانه")}
                unit={ta("رزرو")}
                points={data.series.reservations}
              />
            </section>
          </div>

          <Card
            title={ta("آخرین کاربران")}
            action={
              <Link href={adminPath("/user")} className={classes.more}>
                {ta("همه کاربران")}
              </Link>
            }
          >
            <div className={classes.tableWrap}>
              <table className={classes.table}>
                <thead>
                  <tr>
                    <th>{ta("موبایل")}</th>
                    <th>{ta("نام کاربری")}</th>
                    <th>{ta("نقش")}</th>
                    <th>{ta("تاریخ عضویت")}</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentUsers.map((user) => (
                    <tr key={user._id}>
                      <td>
                        <Link href={adminPath(`/user/${user._id}`)} className={classes.phone}>
                          {displayPhone(user.phone)}
                        </Link>
                      </td>
                      <td>{user.username || "—"}</td>
                      <td>
                        <span className={`${classes.role} ${classes[`role_${user.role}`] || ""}`}>
                          {roleLabels[user.role] || user.role}
                        </span>
                      </td>
                      <td>{shortDate.format(new Date(user.createdAt))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
    </HandleLoading>
  );
};

// Restricted staff can't read the global dashboard (backend is admin-only),
// so they get a short welcome pointing at the menu instead.
const AdminDashboardPage = () => {
  const { user } = useUser();
  if (user?.role !== "admin")
    return (
      <div className={classes.main}>
        <section className={classes.card}>
          <h1 className={classes.pageTitle}>{ta("به پنل مدیریت خوش آمدید")}</h1>
          <p className={classes.welcome}>
            {ta("برای شروع، بخش مورد نظر خود را از منوی کناری انتخاب کنید.")}
          </p>
          {/* the work queue, filtered to what this role may handle */}
          <Link href={adminPath("/inbox")} className={classes.inboxLink}>
            {ta("کارهای در انتظار")}
          </Link>
        </section>
      </div>
    );
  return <AdminDashboard />;
};

export default AdminDashboardPage;
