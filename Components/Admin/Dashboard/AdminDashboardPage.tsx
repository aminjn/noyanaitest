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
      locale="fa-IR"
      rtl
      points={list.map((p) => ({ date: p.date, value: p.count }))}
      formatValue={(value) => `${num.format(value)} ${unit}`}
      labels={{
        summary: `${num.format(total)} ${unit} در ${num.format(list.length)} روز اخیر`,
        chart: "نمودار",
        table: "جدول",
        day: "روز",
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
  orders: { paidCount: number; paidTotal: number };
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

const num = new Intl.NumberFormat("fa-IR");
const dateTime = new Intl.DateTimeFormat("fa-IR", {
  month: "long",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});
const shortDate = new Intl.DateTimeFormat("fa-IR", {
  year: "numeric",
  month: "short",
  day: "numeric",
});

const roleLabels: Record<string, string> = {
  admin: "سوپر ادمین",
  notadmin: "کارمند",
  user: "کاربر",
};

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
  label,
  value,
  note,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  note?: string;
}) => (
  <div className={classes.tile}>
    <div className={classes.tileHead}>
      <Ixon width="1.25rem" className={classes.tileIcon}>
        {icon}
      </Ixon>
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
              <h1 className={classes.pageTitle}>داشبورد</h1>
              <span className={classes.updated}>
                {`به‌روزرسانی: ${dateTime.format(new Date(data.generatedAt))}`}
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
              <span>{isValidating ? "در حال بارگذاری..." : "به‌روزرسانی"}</span>
            </button>
          </header>

          <div className={classes.tiles}>
            <StatTile
              icon={<UserGroupIcon />}
              label="کاربران"
              value={num.format(data.totals.users)}
              note={`${num.format(data.totals.newUsers)} کاربر جدید در ${num.format(data.periodDays)} روز اخیر`}
            />
            <StatTile
              icon={<CalendarIcon />}
              label={`رزروها (${num.format(data.periodDays)} روز)`}
              value={num.format(data.reservations.total)}
              note={`${num.format(data.reservations.byStatus.completed || 0)} نوبت انجام‌شده`}
            />
            <StatTile
              icon={<ShoppingCartIcon />}
              label={`فروش سفارش‌ها (${num.format(data.periodDays)} روز)`}
              value={`${num.format(data.orders.paidTotal)} تومان`}
              note={`${num.format(data.orders.paidCount)} سفارش پرداخت‌شده`}
            />
            <StatTile
              icon={<WalletIcon />}
              label={`درآمد نوبت‌ها (${num.format(data.periodDays)} روز)`}
              value={`${num.format(data.reservations.completedTotal)} تومان`}
              note="مجموع مبلغ نوبت‌های انجام‌شده"
            />
          </div>

          <div className={classes.row}>
            <Card
              title="کارهای در انتظار"
              className={classes.pendingCard}
              action={
                data.pending.length > 0 && (
                  <Link href={adminPath("/inbox")} className={classes.inboxLink}>
                    <span>صندوق درخواست‌ها</span>
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
                  <span>کار معوقه‌ای وجود ندارد</span>
                </div>
              ) : (
                <ul className={classes.pendingList}>
                  {data.pending.map((item) => {
                    const content = (
                      <>
                        <span className={classes.pendingTitle}>{item.title}</span>
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

            <Card title="مراکز و ارائه‌دهندگان">
              <div className={classes.entityGrid}>
                {(
                  [
                    ["پزشکان", data.totals.doctors, "doctorprofile"],
                    ["کلینیک‌ها", data.totals.clinics, "clinic"],
                    ["بیمارستان‌ها", data.totals.hospitals, "hospital"],
                    ["داروخانه‌ها", data.totals.pharmacies, "pharmacy"],
                    ["پاراکلینیک‌ها", data.totals.paraClinics, "paraClinic"],
                    ["بیمه‌ها", data.totals.insurances, "insurance"],
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
                  {`وضعیت رزروهای ${num.format(data.periodDays)} روز اخیر`}
                </span>
                <div className={classes.statusList}>
                  {reservationStatusLabels.map(([key, label]) => (
                    <span key={key} className={classes.statusChip}>
                      <span>{label}</span>
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
                title="ثبت‌نام روزانه"
                unit="ثبت‌نام"
                points={data.series.signups}
              />
            </section>
            <section className={classes.card}>
              <AdminDailyChart
                title="رزرو روزانه"
                unit="رزرو"
                points={data.series.reservations}
              />
            </section>
          </div>

          <Card
            title="آخرین کاربران"
            action={
              <Link href={adminPath("/user")} className={classes.more}>
                همه کاربران
              </Link>
            }
          >
            <div className={classes.tableWrap}>
              <table className={classes.table}>
                <thead>
                  <tr>
                    <th>موبایل</th>
                    <th>نام کاربری</th>
                    <th>نقش</th>
                    <th>تاریخ عضویت</th>
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
          <h1 className={classes.pageTitle}>به پنل مدیریت خوش آمدید</h1>
          <p className={classes.welcome}>
            برای شروع، بخش مورد نظر خود را از منوی کناری انتخاب کنید.
          </p>
        </section>
      </div>
    );
  return <AdminDashboard />;
};

export default AdminDashboardPage;
