"use client";

import Link from "@/Components/i18n/Link";
import { useMemo } from "react";
import { useIntlLocale } from "@/Components/i18n/navigation";
import useSWR from "swr";
import classes from "./DoctorDashboard.module.css";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import { ContentKey } from "@/Components/Enums/contentKeys";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import Ixon from "@/Components/UI/Ixon";
import CalendarIcon from "@/Components/Icons/CalendarIcon";
import ClockIcon from "@/Components/Icons/ClockIcon";
import WalletIcon from "@/Components/Icons/WalletIcon";
import PackageIcon from "@/Components/Icons/PackageIcon";
import CheckCircleIcon from "@/Components/Icons/CheckCircleIcon";
import ChevronIcon from "@/Components/Icons/ChevronIcon";
import StarIcon from "@/Components/Icons/StarIcon";
import CurrentLicenseWidget from "../CurrentLicenseWidget";

const NS: ContentNamespace[] = ["common", "doctorPanelHome"];

type TodayReservation = {
  _id: string;
  start: number;
  end: number;
  status: string;
  sessionType: string;
  patient?: { givenName: string; lastName: string } | null;
  user?: { phone: string } | null;
  office?: { name?: string } | null;
};

type DoctorDashboardData = {
  doctor: {
    firstName?: string;
    lastName?: string;
    active: boolean;
    slug?: string;
    averageScore?: number;
    feedbackCount?: number;
  };
  isOwner: boolean;
  periodDays: number;
  upcomingDays: number;
  today: TodayReservation[] | null;
  upcoming: number | null;
  period: {
    byStatus: Record<string, number>;
    total: number;
    completedIncome: number | null;
  } | null;
  pendingOrders: number | null;
  setup: { key: string; done: boolean }[] | null;
};

// minutes from midnight -> "09:30" in the current language's digits
const formatTime = (num: Intl.NumberFormat, minutes: number) => {
  const two = (n: number) => num.format(n).padStart(2, num.format(0));
  return `${two(Math.floor(minutes / 60))}:${two(minutes % 60)}`;
};

const statusKeys: Record<string, ContentKey> = {
  pending: "reservationStatusPending",
  active: "reservationStatusActive",
  completed: "reservationStatusCompleted",
  cancelled: "reservationStatusCancelled",
  noShow: "reservationStatusNoShow",
  error: "reservationStatusError",
};

const setupSteps: Record<string, { label: ContentKey; href: string }> = {
  profile: { label: "dpdSetupProfile", href: "/doctorpanel/profile" },
  introduction: { label: "dpdSetupIntroduction", href: "/doctorpanel/profile" },
  office: { label: "dpdSetupOffice", href: "/doctorpanel/office" },
  settings: { label: "dpdSetupSettings", href: "/doctorpanel/settings" },
  shift: { label: "dpdSetupShift", href: "/doctorpanel/shift" },
  service: { label: "dpdSetupService", href: "/doctorpanel/service" },
};

const Tile = ({
  icon,
  label,
  value,
  unit,
  note,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  unit?: string;
  note?: string;
  href?: string;
}) => {
  const body = (
    <>
      <span className={classes.tileHead}>
        <Ixon width="1.25rem" className={classes.tileIcon}>
          {icon}
        </Ixon>
        <span>{label}</span>
      </span>
      <span className={classes.tileValue}>
        {value}
        {unit && <span className={classes.tileUnit}>{unit}</span>}
      </span>
      {note && <span className={classes.tileNote}>{note}</span>}
    </>
  );
  return href ? (
    <Link href={href} className={`${classes.tile} ${classes.tileLink}`}>
      {body}
    </Link>
  ) : (
    <div className={classes.tile}>{body}</div>
  );
};

const DoctorDashboard = () => {
  const getContent = useScopedLocale(NS);
  const intlTag = useIntlLocale();
  const num = useMemo(() => new Intl.NumberFormat(intlTag), [intlTag]);
  const time = (minutes: number) => formatTime(num, minutes);
  const { data, error } = useSWR<DoctorDashboardData>(
    `${API}/doctor/dashboard`,
    (url: string) => fetcher({ url }).then((res) => res.data),
  );

  const remainingSteps = data?.setup?.filter((step) => !step.done) || [];

  return (
    <HandleLoading data={!!data} error={error}>
      {data && (
        <div className={classes.main}>
          <header className={classes.header}>
            <div>
              <h1 className={classes.title}>
                {getContent("dpdGreeting", [
                  [data.doctor.firstName, data.doctor.lastName].filter(Boolean).join(" "),
                ])}
              </h1>
              <span className={classes.subtitle}>{getContent("dpdSubtitle")}</span>
            </div>
            <div className={classes.headerSide}>
              {!!data.doctor.feedbackCount && (
                <span className={classes.rating}>
                  <Ixon width="1rem">
                    <StarIcon />
                  </Ixon>
                  {getContent("dpdRating", [
                    num.format(Math.round((data.doctor.averageScore || 0) * 10) / 10),
                    num.format(data.doctor.feedbackCount),
                  ])}
                </span>
              )}
              {data.doctor.slug && data.doctor.active && (
                <Link href={`/dr/${data.doctor.slug}`} className={classes.link} target="_blank">
                  {getContent("dpdViewPublicProfile")}
                </Link>
              )}
            </div>
          </header>

          {!data.doctor.active && data.isOwner && (
            <p className={classes.notice}>{getContent("dpdProfileInactive")}</p>
          )}

          {data.setup && remainingSteps.length > 0 && (
            <section className={classes.card}>
              <div className={classes.cardHead}>
                <h2 className={classes.cardTitle}>{getContent("dpdSetupTitle")}</h2>
                <span className={classes.badge}>
                  {getContent("dpdStepsLeft", [num.format(remainingSteps.length)])}
                </span>
              </div>
              <p className={classes.muted}>{getContent("dpdSetupDescription")}</p>
              <div className={classes.progress} aria-hidden>
                <span
                  style={{
                    width: `${((data.setup.length - remainingSteps.length) / data.setup.length) * 100}%`,
                  }}
                />
              </div>
              <ul className={classes.steps}>
                {data.setup.map((step) => {
                  const info = setupSteps[step.key];
                  if (!info) return null;
                  return (
                    <li key={step.key}>
                      <Link
                        href={info.href}
                        className={`${classes.step} ${step.done ? classes.stepDone : ""}`}
                      >
                        <span className={classes.stepCheck}>
                          {step.done && (
                            <Ixon width="1rem">
                              <CheckCircleIcon />
                            </Ixon>
                          )}
                        </span>
                        <span className={classes.stepLabel}>{getContent(info.label)}</span>
                        {!step.done && (
                          <Ixon width="0.9rem" className={classes.arrow}>
                            <ChevronIcon />
                          </Ixon>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          <div className={classes.tiles}>
            {data.today && (
              <Tile
                icon={<ClockIcon />}
                label={getContent("dpdTodayAppointments")}
                value={num.format(data.today.length)}
                href="/doctorpanel/schedule"
              />
            )}
            {data.upcoming !== null && (
              <Tile
                icon={<CalendarIcon />}
                label={getContent("dpdUpcoming", [num.format(data.upcomingDays)])}
                value={num.format(data.upcoming)}
                href="/doctorpanel/schedule"
              />
            )}
            {data.period && (
              <Tile
                icon={<CalendarIcon />}
                label={getContent("dpdPeriodReservations", [num.format(data.periodDays)])}
                value={num.format(data.period.total)}
                note={getContent("dpdCompletedCount", [
                  num.format(data.period.byStatus.completed || 0),
                ])}
              />
            )}
            {data.period?.completedIncome != null && (
              <Tile
                icon={<WalletIcon />}
                label={getContent("dpdIncome", [num.format(data.periodDays)])}
                value={num.format(data.period.completedIncome)}
                unit={getContent("toman")}
                note={getContent("dpdIncomeNote")}
              />
            )}
            {data.pendingOrders !== null && (
              <Tile
                icon={<PackageIcon />}
                label={getContent("dpdPendingOrders")}
                value={num.format(data.pendingOrders)}
                note={getContent("dpdPendingOrdersNote")}
                href="/doctorpanel/order"
              />
            )}
          </div>

          <div className={classes.row}>
            {data.today && (
              <section className={classes.card}>
                <div className={classes.cardHead}>
                  <h2 className={classes.cardTitle}>{getContent("dpdTodayAppointments")}</h2>
                  <Link href="/doctorpanel/schedule" className={classes.link}>
                    {getContent("dpdViewAll")}
                  </Link>
                </div>
                {data.today.length === 0 ? (
                  <p className={classes.empty}>{getContent("dpdNoAppointmentsToday")}</p>
                ) : (
                  <ul className={classes.appointments}>
                    {data.today.map((r) => (
                      <li key={r._id}>
                        <Link href={`/doctorpanel/booking/${r._id}`} className={classes.appointment}>
                          <span className={classes.time}>
                            {time(r.start)}
                            <span className={classes.timeEnd}>{time(r.end)}</span>
                          </span>
                          <span className={classes.who}>
                            <strong>
                              {r.patient ? `${r.patient.givenName} ${r.patient.lastName}` : "—"}
                            </strong>
                            <span className={classes.muted}>
                              {[getContent(r.sessionType as ContentKey), r.office?.name]
                                .filter(Boolean)
                                .join(" · ")}
                            </span>
                          </span>
                          <span className={`${classes.status} ${classes[`status_${r.status}`] || ""}`}>
                            {statusKeys[r.status] ? getContent(statusKeys[r.status]) : r.status}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            )}
            <div className={classes.side}>
              <CurrentLicenseWidget />
            </div>
          </div>
        </div>
      )}
    </HandleLoading>
  );
};

export default DoctorDashboard;
