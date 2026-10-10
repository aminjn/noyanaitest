"use client";
import { TEHRAN_TZ, tehranMinutesOfDay } from "@/Components/helpers/tehranTime";

import Link from "@/Components/i18n/Link";
import { ReactNode, useEffect, useMemo, useState } from "react";
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
import AiOrb from "@/Components/UI/AiOrb";
import SparkIcon from "@/Components/Icons/SparkIcon";
import CalendarIcon from "@/Components/Icons/CalendarIcon";
import ClockIcon from "@/Components/Icons/ClockIcon";
import WalletIcon from "@/Components/Icons/WalletIcon";
import PackageIcon from "@/Components/Icons/PackageIcon";
import CheckCircleIcon from "@/Components/Icons/CheckCircleIcon";
import ChevronIcon from "@/Components/Icons/ChevronIcon";
import StarIcon from "@/Components/Icons/StarIcon";
import Bell01Icon from "@/Components/Icons/Bell01Icon";
import ChatBubbleIcon from "@/Components/Icons/ChatBubbleIcon";
import UserCheckIcon from "@/Components/Icons/UserCheckIcon";
import FileIcon from "@/Components/Icons/FileIcon";
import CurrentLicenseWidget from "../CurrentLicenseWidget";
import BookingStatusCard from "../BookingStatus/BookingStatusCard";
import LicenseRenewBanner from "../LicenseRenewBanner";
import VisitQuickActions from "../Desk/VisitQuickActions";

const NS: ContentNamespace[] = ["common", "doctorPanelHome"];

type TodayReservation = {
  _id: string;
  date: string;
  patientPresentAt?: string;
  start: number;
  end: number;
  status: string;
  sessionType: string;
  patient?: { givenName?: string; lastName?: string } | null;
  user?: { _id?: string; phone?: string } | null;
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
  // added for the assistant card; older backends simply omit them
  noShowHistory?: Record<string, { missed: number; visits: number }> | null;
  month?: { days: number; elapsed: number; daily: number[]; booked: number } | null;
  unreadMessages?: number | null;
  intakes?: Record<string, { complaint?: string; aiSummary?: string; redFlags?: string[] }> | null;
};

type Suggestion = {
  key: string;
  icon: ReactNode;
  tone: "warn" | "ai" | "accent" | "ok";
  title: string;
  meta?: string;
  href: string;
};

// minutes from midnight -> "09:30" in the current language's digits
const formatTime = (num: Intl.NumberFormat, minutes: number) => {
  const two = (n: number) => num.format(n).padStart(2, num.format(0));
  return `${two(Math.floor(minutes / 60))}:${two(minutes % 60)}`;
};

// Tehran's clock: visit minutes are Tehran wall-clock
const nowMinutes = () => tehranMinutesOfDay();

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
  // recommended, never required to go live
  avatar: { label: "bsNoAvatar", href: "/doctorpanel/profile" },
  introduction: { label: "dpdSetupIntroduction", href: "/doctorpanel/profile" },
  office: { label: "dpdSetupOffice", href: "/doctorpanel/office" },
  settings: { label: "dpdSetupSettings", href: "/doctorpanel/settings" },
  shift: { label: "dpdSetupShift", href: "/doctorpanel/shift" },
  service: { label: "dpdSetupService", href: "/doctorpanel/service" },
};

// the steps without which patients can't book at all; the rest (profile,
// introduction, services) only make the profile stronger
// the steps that publish the page (Lib/doctorPublish.ts on the backend)
const BOOKING_STEPS = ["profile", "office", "settings", "shift"];

const QUIET_WEEK = 5;

const patientName = (r: TodayReservation) =>
  [r.patient?.givenName, r.patient?.lastName].filter(Boolean).join(" ") || "—";

const initial = (name: string) => (name === "—" ? "?" : name.trim().charAt(0));

// Stable gradient per patient, so the same person keeps the same color.
const AVATAR_GRADIENTS = ["g1", "g2", "g3", "g4", "g5", "g6"];
const avatarClass = (seed: string) => {
  let h = 0;
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return classes[AVATAR_GRADIENTS[h % AVATAR_GRADIENTS.length]];
};

const Avatar = ({ name, seed, big }: { name: string; seed: string; big?: boolean }) => (
  <span className={`${classes.avatar} ${big ? classes.avatarBig : ""} ${avatarClass(seed)}`} aria-hidden>
    {initial(name)}
  </span>
);

// KPI / suggestion tone -> glass icon tile tone (globals.css .tone-*)
const GLASS_TONE: Record<string, string> = {
  warn: "tone-amber",
  ai: "tone-violet",
  violet: "tone-violet",
  accent: "tone-indigo",
  blue: "tone-indigo",
  ok: "tone-teal",
  green: "tone-teal",
  sky: "tone-sky",
};

const Kpi = ({
  icon,
  tone,
  label,
  value,
  note,
  href,
  ai,
}: {
  icon: ReactNode;
  tone: string;
  label: string;
  value: string;
  note?: string;
  href?: string;
  ai?: boolean;
}) => {
  const body = (
    <>
      <span className={classes.kpiHead}>
        <span className={`${classes.kpiIcon} glassIcon ${GLASS_TONE[tone] || ""}`}>
          <Ixon width="1.1rem">{icon}</Ixon>
        </span>
        <span>{label}</span>
      </span>
      <span className={`${classes.kpiValue} ${ai ? classes.aiText : ""}`}>{value}</span>
      {note && <span className={classes.kpiNote}>{note}</span>}
    </>
  );
  return href ? (
    <Link href={href} className={`${classes.kpi} ${classes.glass} ${classes.hoverable}`}>
      {body}
    </Link>
  ) : (
    <div className={`${classes.kpi} ${classes.glass}`}>{body}</div>
  );
};

// Cumulative income this month, with the forecast as a dashed tail.
// Drawn left-to-right; mirrored by CSS on right-to-left pages.
const IncomeChart = ({
  daily,
  elapsed,
  forecast,
  label,
}: {
  daily: number[];
  elapsed: number;
  forecast: number;
  label: string;
}) => {
  const W = 400;
  const H = 170;
  const pad = 6;
  const days = daily.length;
  const cum: number[] = [];
  daily.slice(0, elapsed).reduce((sum, v) => {
    cum.push(sum + v);
    return sum + v;
  }, 0);
  const last = cum[cum.length - 1] || 0;
  const max = Math.max(forecast, last, 1) * 1.08;
  const x = (i: number) => pad + ((W - 2 * pad) * i) / Math.max(days - 1, 1);
  const y = (v: number) => H - pad - ((H - 2 * pad) * v) / max;
  const line = cum.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  const area = cum.length ? `${line} L${x(cum.length - 1).toFixed(1)},${H} L${x(0).toFixed(1)},${H} Z` : "";
  const endX = x(Math.max(cum.length - 1, 0));
  const endY = y(last);
  return (
    <svg className={classes.chart} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" role="img" aria-label={label}>
      <defs>
        <linearGradient id="dpdArea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--ai)" stopOpacity="0.32" />
          <stop offset="1" stopColor="var(--ai)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map((f) => (
        <line key={f} x1="0" x2={W} y1={H * f} y2={H * f} stroke="var(--line)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
      ))}
      {area && <path d={area} fill="url(#dpdArea)" />}
      {line && (
        <path d={line} fill="none" stroke="var(--ai)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      )}
      <path
        d={`M${endX.toFixed(1)},${endY.toFixed(1)} L${x(days - 1).toFixed(1)},${y(forecast).toFixed(1)}`}
        fill="none"
        stroke="var(--ai)"
        strokeWidth="2"
        strokeDasharray="4 5"
        strokeLinecap="round"
        opacity="0.85"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
};

const DoctorDashboard = () => {
  const getContent = useScopedLocale(NS);
  const intlTag = useIntlLocale();
  const num = useMemo(() => new Intl.NumberFormat(intlTag), [intlTag]);
  const compact = useMemo(
    () => new Intl.NumberFormat(intlTag, { notation: "compact", maximumFractionDigits: 1 }),
    [intlTag],
  );
  // weekday and date formatted apart: ICU joins them in a scrambled order for fa
  const dateFormats = useMemo(
    () => ({
      weekday: new Intl.DateTimeFormat(intlTag, { timeZone: TEHRAN_TZ, weekday: "long" }),
      date: new Intl.DateTimeFormat(intlTag, { timeZone: TEHRAN_TZ, day: "numeric", month: "long", year: "numeric" }),
    }),
    [intlTag],
  );
  const time = (minutes: number) => formatTime(num, minutes);
  const { data, error, mutate } = useSWR<DoctorDashboardData>(`${API}/doctor/dashboard`, (url: string) =>
    fetcher({ url }).then((res) => res.data),
  );

  // re-evaluate "next patient" every minute
  const [now, setNow] = useState<number>(nowMinutes);
  const [today, setToday] = useState<[string, string]>(["", ""]);
  useEffect(() => {
    const d = new Date();
    setToday([dateFormats.weekday.format(d), dateFormats.date.format(d)]);
    const t = setInterval(() => setNow(nowMinutes()), 60_000);
    return () => clearInterval(t);
  }, [dateFormats]);

  const view = useMemo(() => {
    if (!data) return null;
    const list = Array.isArray(data.today) ? data.today : [];
    const history = data.noShowHistory || {};
    const historyOf = (r: TodayReservation) => (r.user?._id ? history[r.user._id] : undefined);
    const open = list.filter((r) => r.status === "pending" || r.status === "active");
    const next = open.find((r) => r.end > now) || null;
    const done = list.filter((r) => r.status === "completed").length;
    const remainingSteps = (Array.isArray(data.setup) ? data.setup : []).filter((s) => !s.done);

    const suggestions: Suggestion[] = [];
    for (const r of open) {
      const h = historyOf(r);
      if (h && h.missed > 0 && r.start > now) {
        suggestions.push({
          key: `remind-${r._id}`,
          icon: <Bell01Icon />,
          tone: "warn",
          title: getContent("dpdSugReminder", [patientName(r)]),
          meta: getContent("dpdSugReminderMeta", [num.format(h.missed), num.format(h.visits), time(r.start)]),
          href: `/doctorpanel/booking/${r._id}`,
        });
      }
    }
    if (data.unreadMessages) {
      suggestions.push({
        key: "messages",
        icon: <ChatBubbleIcon />,
        tone: "accent",
        title: getContent("dpdSugMessages", [num.format(data.unreadMessages)]),
        meta: getContent("dpdSugMessagesMeta"),
        href: "/doctorpanel/chat",
      });
    }
    if (data.pendingOrders) {
      suggestions.push({
        key: "orders",
        icon: <PackageIcon />,
        tone: "ai",
        title: getContent("dpdSugOrders", [num.format(data.pendingOrders)]),
        meta: getContent("dpdPendingOrdersNote"),
        href: "/doctorpanel/order",
      });
    }
    if (remainingSteps.length) {
      // "N steps to be bookable" only while a booking step is missing; a
      // doctor who already takes bookings sees "complete your profile"
      const blocking = remainingSteps.filter((s) => BOOKING_STEPS.includes(s.key));
      const first = setupSteps[(blocking[0] || remainingSteps[0]).key];
      suggestions.push({
        key: "setup",
        icon: <UserCheckIcon />,
        tone: "ok",
        title: blocking.length
          ? getContent("dpdSugSetup", [num.format(blocking.length)])
          : getContent("dpdSugProfile", [num.format(remainingSteps.length)]),
        meta: getContent(blocking.length ? "dpdSugSetupMeta" : "dpdSugProfileMeta"),
        href: first?.href || "/doctorpanel/profile",
      });
    }
    if (data.isOwner && data.upcoming !== null && data.upcoming < QUIET_WEEK && !remainingSteps.length) {
      suggestions.push({
        key: "quiet",
        icon: <CalendarIcon />,
        tone: "ai",
        title: getContent("dpdSugQuietWeek"),
        meta: getContent("dpdSugQuietWeekMeta", [num.format(data.upcoming), num.format(data.upcomingDays)]),
        href: "/doctorpanel/shift",
      });
    }

    let monthIncome: number | null = null;
    let forecast: number | null = null;
    const m = data.month;
    if (m && Array.isArray(m.daily) && m.daily.length) {
      const elapsed = Math.min(Math.max(m.elapsed, 1), m.daily.length);
      monthIncome = m.daily.slice(0, elapsed).reduce((a, b) => a + b, 0);
      const trend = (monthIncome / elapsed) * (m.daily.length - elapsed);
      forecast = monthIncome + Math.max(m.booked || 0, trend);
    }

    return { list, next, done, open, historyOf, suggestions, remainingSteps, monthIncome, forecast };
  }, [data, getContent, now, num]); // eslint-disable-line react-hooks/exhaustive-deps

  const name = data ? [data.doctor.firstName, data.doctor.lastName].filter(Boolean).join(" ") : "";

  return (
    <HandleLoading data={!!data} error={error}>
      {data && view && (
        <div className={classes.main}>
          <header className={classes.header}>
            <div className={classes.hello}>
              <span className={classes.date}>
                <span>{today[0]}</span>
                <span>{today[1]}</span>
              </span>
              <h1 className={classes.title}>{getContent("dpdGreeting", [name])}</h1>
            </div>
            <div className={classes.headerSide}>
              {!!data.doctor.feedbackCount && (
                <span className={`${classes.pill} ${classes.glass}`}>
                  <Ixon width="1rem" className={classes.star}>
                    <StarIcon />
                  </Ixon>
                  {getContent("dpdRating", [
                    num.format(Math.round((data.doctor.averageScore || 0) * 10) / 10),
                    num.format(data.doctor.feedbackCount),
                  ])}
                </span>
              )}
              {data.doctor.slug && data.doctor.active && (
                <Link href={`/dr/${data.doctor.slug}`} className={`${classes.pill} ${classes.glass}`} target="_blank">
                  {getContent("dpdViewPublicProfile")}
                </Link>
              )}
            </div>
          </header>

          {/* can patients book now, and what is missing (shown until live) */}
          {data.isOwner && <BookingStatusCard hideWhenLive />}

          <LicenseRenewBanner />

          <div className={classes.rowTop}>
            {/* ---- assistant ---- */}
            <section className={`${classes.assistant} ${classes.glass}`} aria-labelledby="dpd-assistant">
              <span className={classes.glow} aria-hidden />
              <div className={classes.assistantHead}>
                <AiOrb size="3.5rem" />
                <div className={classes.assistantTitles}>
                  <h2 id="dpd-assistant" className={classes.assistantTitle}>
                    {getContent("dpdAssistantTitle")}
                  </h2>
                  <span className={classes.aiText}>
                    {view.suggestions.length
                      ? getContent("dpdAssistantCount", [num.format(view.suggestions.length)])
                      : getContent("dpdAssistantAllClear")}
                  </span>
                </div>
              </div>
              <p className={classes.brief}>
                {data.today === null
                  ? getContent("dpdSubtitle")
                  : view.list.length
                    ? getContent("dpdBriefToday", [num.format(view.list.length)])
                    : getContent("dpdBriefNoneToday")}{" "}
                {view.next && getContent("dpdBriefNext", [patientName(view.next), time(view.next.start)])}
              </p>
              {view.suggestions.length > 0 ? (
                <ul className={classes.suggestions}>
                  {view.suggestions.slice(0, 5).map((s) => (
                    <li key={s.key}>
                      <Link href={s.href} className={classes.suggestion}>
                        <span className={`${classes.sugIcon} glassIcon ${GLASS_TONE[s.tone] || ""}`}>
                          <Ixon width="1rem">{s.icon}</Ixon>
                        </span>
                        <span className={classes.sugText}>
                          <strong>{s.title}</strong>
                          {s.meta && <span>{s.meta}</span>}
                        </span>
                        <Ixon width="0.9rem" className={classes.sugArrow}>
                          <ChevronIcon />
                        </Ixon>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={classes.allClear}>{getContent("dpdAssistantEmpty")}</p>
              )}
              <span className={classes.aiNote}>
                <Ixon width="0.85rem">
                  <SparkIcon />
                </Ixon>
                {getContent("dpdAssistantNote")}
              </span>
            </section>

            {/* ---- KPIs ---- */}
            <div className={classes.kpis}>
              {data.today !== null && (
                <Kpi
                  icon={<ClockIcon />}
                  tone="blue"
                  label={getContent("dpdTodayAppointments")}
                  value={num.format(view.list.length)}
                  note={getContent("dpdDoneOf", [num.format(view.done), num.format(view.open.length)])}
                  href="/doctorpanel/schedule"
                />
              )}
              {data.upcoming !== null && (
                <Kpi
                  icon={<CalendarIcon />}
                  tone="sky"
                  label={getContent("dpdUpcoming", [num.format(data.upcomingDays)])}
                  value={num.format(data.upcoming)}
                  href="/doctorpanel/schedule"
                />
              )}
              {view.monthIncome !== null ? (
                <Kpi
                  icon={<WalletIcon />}
                  tone="green"
                  label={getContent("dpdMonthIncome")}
                  value={compact.format(view.monthIncome)}
                  note={getContent("toman")}
                  href="/doctorpanel/finance"
                />
              ) : (
                data.period && (
                  <Kpi
                    icon={<CalendarIcon />}
                    tone="green"
                    label={getContent("dpdPeriodReservations", [num.format(data.periodDays)])}
                    value={num.format(data.period.total)}
                    note={getContent("dpdCompletedCount", [num.format(data.period.byStatus?.completed || 0)])}
                  />
                )
              )}
              {view.forecast !== null ? (
                <Kpi
                  icon={<SparkIcon />}
                  tone="violet"
                  label={getContent("dpdForecast")}
                  value={compact.format(view.forecast)}
                  note={getContent("dpdForecastNote")}
                  ai
                />
              ) : (
                data.pendingOrders !== null && (
                  <Kpi
                    icon={<PackageIcon />}
                    tone="violet"
                    label={getContent("dpdPendingOrders")}
                    value={num.format(data.pendingOrders)}
                    note={getContent("dpdPendingOrdersNote")}
                    href="/doctorpanel/order"
                  />
                )
              )}
            </div>
          </div>

          {data.setup && view.remainingSteps.length > 0 && (
            <section className={`${classes.card} ${classes.glass} ${classes.setupCard}`}>
              <div className={classes.cardHead}>
                <h2 className={classes.cardTitle}>{getContent("dpdSetupTitle")}</h2>
                <span className={classes.badge}>
                  {getContent("dpdStepsLeft", [num.format(view.remainingSteps.length)])}
                </span>
              </div>
              <p className={classes.muted}>
                {getContent(
                  view.remainingSteps.some((s) => BOOKING_STEPS.includes(s.key))
                    ? "dpdSetupDescription"
                    : "dpdSetupBookableDone",
                )}
              </p>
              <div className={classes.progress} aria-hidden>
                <span
                  style={{
                    width: `${((data.setup.length - view.remainingSteps.length) / data.setup.length) * 100}%`,
                  }}
                />
              </div>
              <ul className={classes.steps}>
                {data.setup.map((step) => {
                  const info = setupSteps[step.key];
                  if (!info) return null;
                  return (
                    <li key={step.key}>
                      <Link href={info.href} className={`${classes.step} ${step.done ? classes.stepDone : ""}`}>
                        <span className={classes.stepCheck}>
                          {step.done && (
                            <Ixon width="1rem">
                              <CheckCircleIcon />
                            </Ixon>
                          )}
                        </span>
                        <span className={classes.stepLabel}>{getContent(info.label)}</span>
                        {!step.done && (
                          <Ixon width="0.9rem" className={classes.sugArrow}>
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

          <div className={classes.rowBottom}>
            {/* ---- next patient ---- */}
            {data.today !== null && (
              <section className={`${classes.card} ${classes.glass}`}>
                <div className={classes.cardHead}>
                  <h2 className={classes.cardTitle}>{getContent("dpdNextPatient")}</h2>
                  {view.next && (
                    <span className={classes.countdown}>
                      {view.next.start <= now
                        ? getContent("dpdNow")
                        : view.next.start - now <= 180
                          ? getContent("dpdInMinutes", [num.format(view.next.start - now)])
                          : time(view.next.start)}
                    </span>
                  )}
                </div>
                {view.next ? (
                  <>
                    <div className={classes.nextWho}>
                      <Avatar name={patientName(view.next)} seed={view.next._id} big />
                      <div className={classes.nextText}>
                        <strong>{patientName(view.next)}</strong>
                        <span className={classes.muted}>
                          {[getContent(view.next.sessionType as ContentKey), view.next.office?.name, time(view.next.start)]
                            .filter(Boolean)
                            .join(" · ")}
                        </span>
                      </div>
                    </div>
                    {(() => {
                      const intake = data.intakes?.[view.next._id];
                      const flags = Array.isArray(intake?.redFlags) ? intake.redFlags.length : 0;
                      if (!intake) return null;
                      return (
                        <div className={classes.aiBox}>
                          <span className={classes.aiLabel}>
                            <Ixon width="0.85rem">
                              <SparkIcon />
                            </Ixon>
                            {getContent("dpdIntakeSummary")}
                          </span>
                          <span>{intake.aiSummary || intake.complaint}</span>
                          {flags > 0 && <span className={classes.flagLine}>{getContent("dpdIntakeRedFlags")}</span>}
                        </div>
                      );
                    })()}
                    <div className={classes.aiBox}>
                      <span className={classes.aiLabel}>
                        <Ixon width="0.85rem">
                          <SparkIcon />
                        </Ixon>
                        {getContent("dpdPatientFacts")}
                      </span>
                      <span>
                        {(() => {
                          const h = view.historyOf(view.next);
                          if (!h || !h.visits) return getContent("dpdFirstVisit");
                          return h.missed
                            ? `${getContent("dpdPastVisits", [num.format(h.visits)])} · ${getContent("dpdMissedVisits", [num.format(h.missed)])}`
                            : getContent("dpdPastVisits", [num.format(h.visits)]);
                        })()}
                      </span>
                      {data.intakes && !data.intakes[view.next._id] && (
                        <span className={classes.muted}>{getContent("dpdIntakeMissing")}</span>
                      )}
                    </div>
                    {/* arrived / didn't come, right from the card (Doctolib) */}
                    <VisitQuickActions visit={view.next} name={patientName(view.next)} onDone={() => mutate()} size="M" />
                    <div className={classes.nextActions}>
                      <Link href={`/doctorpanel/booking/${view.next._id}`} className={classes.cta}>
                        {getContent("dpdStartVisit")}
                      </Link>
                      <Link
                        href={`/doctorpanel/booking/${view.next._id}`}
                        className={classes.iconBtn}
                        aria-label={getContent("dpdPatientFile")}
                      >
                        <Ixon width="1.1rem">
                          <FileIcon />
                        </Ixon>
                      </Link>
                    </div>
                  </>
                ) : (
                  <p className={classes.empty}>{getContent("dpdNoNextPatient")}</p>
                )}
              </section>
            )}

            {/* ---- today's schedule ---- */}
            {data.today !== null && (
              <section className={`${classes.card} ${classes.glass}`}>
                <div className={classes.cardHead}>
                  <h2 className={classes.cardTitle}>{getContent("dpdTodayAppointments")}</h2>
                  <Link href="/doctorpanel/schedule" className={classes.link}>
                    {getContent("dpdViewAll")}
                  </Link>
                </div>
                {view.list.length === 0 ? (
                  <p className={classes.empty}>{getContent("dpdNoAppointmentsToday")}</p>
                ) : (
                  <ul className={classes.appointments}>
                    {view.list.map((r) => {
                      const h = view.historyOf(r);
                      const isNext = view.next?._id === r._id;
                      return (
                        <li key={r._id}>
                          <Link
                            href={`/doctorpanel/booking/${r._id}`}
                            className={`${classes.appointment} ${isNext ? classes.isNext : ""} ${
                              r.status === "completed" ? classes.isDone : ""
                            }`}
                          >
                            <span className={classes.time}>{time(r.start)}</span>
                            <Avatar name={patientName(r)} seed={r._id} />
                            <span className={classes.who}>
                              <strong>{patientName(r)}</strong>
                              <span className={classes.muted}>
                                {getContent(r.sessionType as ContentKey)}
                              </span>
                            </span>
                            {isNext ? (
                              <span className={classes.nextChip}>{getContent("dpdNextChip")}</span>
                            ) : h && h.missed > 0 && r.status !== "completed" ? (
                              <span className={classes.riskChip}>
                                <Ixon width="0.75rem">
                                  <SparkIcon />
                                </Ixon>
                                {getContent("dpdMissedVisits", [num.format(h.missed)])}
                              </span>
                            ) : (
                              <span className={`${classes.status} ${classes[`status_${r.status}`] || ""}`}>
                                {statusKeys[r.status] ? getContent(statusKeys[r.status]) : r.status}
                              </span>
                            )}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>
            )}

            {/* ---- income ---- */}
            {view.monthIncome !== null && data.month ? (
              <section className={`${classes.card} ${classes.glass}`}>
                <div className={classes.cardHead}>
                  <div className={classes.incomeHead}>
                    <h2 className={classes.cardTitle}>{getContent("dpdMonthIncome")}</h2>
                    <span className={classes.incomeValue}>
                      {compact.format(view.monthIncome)} <small>{getContent("toman")}</small>
                    </span>
                  </div>
                </div>
                <div className={classes.chartBox}>
                  <IncomeChart
                    daily={data.month.daily}
                    elapsed={Math.min(Math.max(data.month.elapsed, 1), data.month.daily.length)}
                    forecast={view.forecast || view.monthIncome}
                    label={getContent("dpdMonthIncome")}
                  />
                </div>
                <div className={classes.axis}>
                  <span>{getContent("dpdMonthStart")}</span>
                  <span>{getContent("dpdMonthEnd")}</span>
                </div>
                <span className={classes.aiBox}>
                  <span className={classes.aiLabel}>
                    <Ixon width="0.85rem">
                      <SparkIcon />
                    </Ixon>
                    {getContent("dpdChartForecastLegend", [compact.format(view.forecast || 0)])}
                  </span>
                </span>
              </section>
            ) : (
              <div className={classes.side}>
                <CurrentLicenseWidget />
              </div>
            )}
          </div>

          {view.monthIncome !== null && data.month && (
            <div className={classes.licenseRow}>
              <CurrentLicenseWidget />
            </div>
          )}
        </div>
      )}
    </HandleLoading>
  );
};

export default DoctorDashboard;
