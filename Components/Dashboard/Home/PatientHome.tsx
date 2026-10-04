"use client";

import { ReactNode, useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import classes from "./PatientHome.module.css";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import { ContentKey } from "@/Components/Enums/contentKeys";
import { useIntlLocale } from "@/Components/i18n/navigation";
import Link from "@/Components/i18n/Link";
import Ixon from "@/Components/UI/Ixon";
import AiOrb from "@/Components/UI/AiOrb";
import InitialAvatar from "@/Components/UI/InitialAvatar";
import HostedImage from "@/Components/UI/HostedImage";
import SparkIcon from "@/Components/Icons/SparkIcon";
import ChevronIcon from "@/Components/Icons/ChevronIcon";
import CalendarIcon from "@/Components/Icons/CalendarIcon";
import ChatBubbleIcon from "@/Components/Icons/ChatBubbleIcon";
import Bell01Icon from "@/Components/Icons/Bell01Icon";
import UserCheckIcon from "@/Components/Icons/UserCheckIcon";
import FileIcon from "@/Components/Icons/FileIcon";
import StetoscopeIcon from "@/Components/Icons/StetoscopeIcon";
import PackageIcon from "@/Components/Icons/PackageIcon";
import SearchIcon from "@/Components/Icons/SearchIcon";
import ReservationJoinButton from "../Booking/ReservationJoinButton";
import { DoctorSessionType } from "@/Components/DoctorPanel/Calendar/DoctorCalendarDay";
import { safeFormatDate } from "@/Components/helpers/safeFormatDate";
import ProUpsellCard from "@/Components/Pro/ProUpsellCard";
import ProBadge from "@/Components/Pro/ProBadge";
import { useMyPro } from "@/Components/Pro/useProData";

const NS: ContentNamespace[] = ["common", "dashboardHome"];

type DashDoctor = {
  _id: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  slug?: string;
  mainSpeciality?: { name?: string } | null;
};

type PatientDashboard = {
  next: {
    _id: string;
    date: string;
    start: number;
    end: number;
    status: string;
    sessionType: DoctorSessionType;
    doctor?: DashDoctor | null;
    office?: { name?: string } | null;
    chat?: string;
    callRoom?: string;
    intakeFilled: boolean;
  } | null;
  upcomingCount: number;
  recentVisits: {
    _id: string;
    date: string;
    sessionType: string;
    doctor?: DashDoctor | null;
    instructions: string | null;
  }[];
  rebook: { doctor: DashDoctor; lastVisit: string }[];
  profile: { identity: boolean; medical: boolean; vitals: boolean };
  unreadNotifications: number;
  unreadMessages: number;
};

type Suggestion = { key: string; icon: ReactNode; tone: string; title: string; meta?: string; href: string };

const doctorName = (d?: DashDoctor | null) => [d?.firstName, d?.lastName].filter(Boolean).join(" ");

const DoctorAvatar = ({ doctor, size }: { doctor?: DashDoctor | null; size: string }) =>
  doctor?.avatar ? (
    <span className={classes.photo} style={{ width: size, height: size }}>
      <HostedImage src={doctor.avatar} alt={doctorName(doctor)} fill sizes={size} style={{ objectFit: "cover" }} />
    </span>
  ) : (
    <InitialAvatar name={doctorName(doctor) || "?"} seed={doctor?._id || "x"} size={size} />
  );

// Patient panel home: the health assistant first (what to do next), then
// the next visit, quick actions, the doctor's after-visit instructions and
// doctors to book again. The health profile (identity, vitals, medical
// details) follows below, rendered by DashboardPage.
const PatientHome = ({ name }: { name?: string }) => {
  const getContent = useScopedLocale(NS);
  const intlTag = useIntlLocale();
  const num = useMemo(() => new Intl.NumberFormat(intlTag), [intlTag]);
  const fmt = useMemo(
    () => ({
      weekday: new Intl.DateTimeFormat(intlTag, { weekday: "long" }),
      day: new Intl.DateTimeFormat(intlTag, { day: "numeric", month: "long" }),
      full: new Intl.DateTimeFormat(intlTag, { day: "numeric", month: "long", year: "numeric" }),
    }),
    [intlTag],
  );
  const time = (m: number) => {
    const two = (n: number) => num.format(n).padStart(2, num.format(0));
    return `${two(Math.floor(m / 60))}:${two(m % 60)}`;
  };

  // «پرو» (2026-10): members see their badge, others the offer
  const { data: pro } = useMyPro();
  const { data } = useSWR<PatientDashboard>(`${API}/user/dashboard`, (u: string) =>
    fetcher({ url: u }).then((r) => r.data),
  );
  const [today, setToday] = useState("");
  useEffect(() => {
    const d = new Date();
    setToday(`${fmt.weekday.format(d)} ${fmt.full.format(d)}`);
  }, [fmt]);

  const suggestions = useMemo<Suggestion[]>(() => {
    if (!data) return [];
    const out: Suggestion[] = [];
    const next = data.next;
    if (next && next.status === "active" && (next.chat || next.callRoom))
      out.push({
        key: "join",
        icon: <StetoscopeIcon />,
        tone: "blue",
        title: getContent("phSugJoin"),
        meta: getContent("phSugJoinMeta", [doctorName(next.doctor)]),
        href: `/dashboard/booking/${next._id}`,
      });
    if (next && !next.intakeFilled)
      out.push({
        key: "intake",
        icon: <FileIcon />,
        tone: "violet",
        title: getContent("phSugIntake"),
        meta: getContent("phSugIntakeMeta", [doctorName(next.doctor)]),
        href: `/dashboard/booking/${next._id}`,
      });
    const withNotes = (Array.isArray(data.recentVisits) ? data.recentVisits : []).find((v) => v.instructions);
    if (withNotes)
      out.push({
        key: "notes",
        icon: <SparkIcon />,
        tone: "violet",
        title: getContent("phSugInstructions", [doctorName(withNotes.doctor)]),
        meta: safeFormatDate(fmt.full, withNotes.date),
        href: "#after-visit",
      });
    if (data.unreadMessages)
      out.push({
        key: "messages",
        icon: <ChatBubbleIcon />,
        tone: "blue",
        title: getContent("phSugMessages", [num.format(data.unreadMessages)]),
        href: "/dashboard/chat",
      });
    if (!data.profile?.identity)
      out.push({
        key: "identity",
        icon: <UserCheckIcon />,
        tone: "green",
        title: getContent("phSugIdentity"),
        meta: getContent("phSugIdentityMeta"),
        href: "#health",
      });
    else if (!data.profile?.medical)
      out.push({
        key: "medical",
        icon: <UserCheckIcon />,
        tone: "green",
        title: getContent("phSugMedical"),
        meta: getContent("phSugMedicalMeta"),
        href: "#health",
      });
    if (!next && data.rebook?.[0]?.doctor?.slug)
      out.push({
        key: "rebook",
        icon: <CalendarIcon />,
        tone: "amber",
        title: getContent("phSugRebook", [doctorName(data.rebook[0].doctor)]),
        meta: getContent("phLastVisit", [safeFormatDate(fmt.full, data.rebook[0].lastVisit)]),
        href: `/dr/${data.rebook[0].doctor.slug}`,
      });
    if (data.unreadNotifications)
      out.push({
        key: "notifications",
        icon: <Bell01Icon />,
        tone: "amber",
        title: getContent("phSugNotifications", [num.format(data.unreadNotifications)]),
        href: "/dashboard/notification",
      });
    return out;
  }, [data, getContent, num, fmt]);

  const actions: { href: string; icon: ReactNode; title: ContentKey; note: ContentKey; tone: string }[] = [
    { href: "/book", icon: <CalendarIcon />, title: "phActBook", note: "phActBookNote", tone: "blue" },
    { href: "/wizard", icon: <SparkIcon />, title: "phActSymptoms", note: "phActSymptomsNote", tone: "violet" },
    { href: "/drug", icon: <PackageIcon />, title: "phActDrugs", note: "phActDrugsNote", tone: "green" },
    { href: "/paraClinic", icon: <SearchIcon />, title: "phActLabs", note: "phActLabsNote", tone: "amber" },
  ];

  const next = data?.next;
  const recent = (Array.isArray(data?.recentVisits) ? data?.recentVisits : []) || [];
  const rebook = (Array.isArray(data?.rebook) ? data?.rebook : []) || [];

  return (
    <div className={classes.main}>
      <header className={classes.header}>
        <span className={classes.date}>{today}</span>
        <h1 className={classes.title}>
          {name ? getContent("phGreeting", [name]) : getContent("phGreetingPlain")} <ProBadge active={!!pro?.active} />
        </h1>
      </header>

      <div className={classes.top}>
        {/* ---- assistant ---- */}
        <section className={`${classes.card} ${classes.assistant}`} aria-labelledby="ph-assistant">
          <span className={classes.glow} aria-hidden />
          <div className={classes.assistantHead}>
            <AiOrb size="3.25rem" />
            <div className={classes.headText}>
              <h2 id="ph-assistant" className={classes.cardTitle}>
                {getContent("phAssistantTitle")}
              </h2>
              <span className={classes.aiText}>
                {suggestions.length
                  ? getContent("phAssistantCount", [num.format(suggestions.length)])
                  : getContent("phAssistantClear")}
              </span>
            </div>
          </div>
          <p className={classes.brief}>
            {next
              ? getContent("phBriefNext", [
                  doctorName(next.doctor),
                  `${safeFormatDate(fmt.weekday, next.date)} ${safeFormatDate(fmt.day, next.date)}`,
                  time(next.start),
                ])
              : data
                ? getContent("phBriefNone")
                : ""}
          </p>
          {suggestions.length > 0 && (
            <ul className={classes.suggestions}>
              {suggestions.slice(0, 4).map((s) => (
                <li key={s.key}>
                  <Link href={s.href} className={classes.suggestion}>
                    <span className={`${classes.sugIcon} ${classes[s.tone]}`}>
                      <Ixon width="1rem">{s.icon}</Ixon>
                    </span>
                    <span className={classes.sugText}>
                      <strong>{s.title}</strong>
                      {s.meta && <span>{s.meta}</span>}
                    </span>
                    <Ixon width="0.9rem" className={classes.arrow}>
                      <ChevronIcon />
                    </Ixon>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <span className={classes.aiNote}>
            <Ixon width="0.85rem">
              <SparkIcon />
            </Ixon>
            {getContent("phAssistantNote")}
          </span>
        </section>

        {/* ---- next visit ---- */}
        <section className={classes.card} aria-labelledby="ph-next">
          <div className={classes.cardHead}>
            <h2 id="ph-next" className={classes.cardTitle}>
              {getContent("phNextVisit")}
            </h2>
            {!!data?.upcomingCount && data.upcomingCount > 1 && (
              <Link href="/dashboard/booking" className={classes.link}>
                {getContent("phAllBookings", [num.format(data.upcomingCount)])}
              </Link>
            )}
          </div>
          {next ? (
            <>
              <div className={classes.doctor}>
                <DoctorAvatar doctor={next.doctor} size="3.75rem" />
                <div className={classes.doctorText}>
                  <strong>{doctorName(next.doctor) || "—"}</strong>
                  {!!next.doctor?.mainSpeciality?.name && <span>{next.doctor.mainSpeciality.name}</span>}
                </div>
              </div>
              <div className={classes.when}>
                <div>
                  <span>{safeFormatDate(fmt.weekday, next.date)}</span>
                  <strong>{safeFormatDate(fmt.day, next.date)}</strong>
                </div>
                <div>
                  <span>{getContent(next.sessionType as ContentKey)}</span>
                  <strong>{time(next.start)}</strong>
                </div>
              </div>
              <span className={next.intakeFilled ? classes.chipOk : classes.chipTodo}>
                <Ixon width="0.8rem">
                  <SparkIcon />
                </Ixon>
                {next.intakeFilled ? getContent("phIntakeDone") : getContent("phIntakeTodo")}
              </span>
              <div className={classes.nextActions}>
                {next.status === "active" && (!!next.chat || !!next.callRoom) && (
                  <ReservationJoinButton chat={next.chat} callRoom={next.callRoom} sessionType={next.sessionType} />
                )}
                <Link href={`/dashboard/booking/${next._id}`} className={classes.cta}>
                  {getContent("phVisitDetails")}
                </Link>
              </div>
            </>
          ) : (
            <div className={classes.emptyNext}>
              <p>{getContent("phNoNext")}</p>
              <Link href="/book" className={classes.cta}>
                {getContent("phActBook")}
              </Link>
            </div>
          )}
        </section>
      </div>

      {/* ---- quick actions ---- */}
      <nav className={classes.actions} aria-label={getContent("phQuickActions")}>
        {actions.map((a) => (
          <Link key={a.href} href={a.href} className={classes.action}>
            <span className={`${classes.actionIcon} ${classes[a.tone]}`}>
              <Ixon width="1.25rem">{a.icon}</Ixon>
            </span>
            <span className={classes.actionText}>
              <strong>{getContent(a.title)}</strong>
              <span>{getContent(a.note)}</span>
            </span>
          </Link>
        ))}
      </nav>

      {!!pro && !pro.active && pro.onSale && <ProUpsellCard moment="home" />}

      {(recent.length > 0 || rebook.length > 0) && (
        <div className={classes.bottom}>
          {recent.length > 0 && (
            <section id="after-visit" className={classes.card} aria-labelledby="ph-after">
              <h2 id="ph-after" className={classes.cardTitle}>
                {getContent("phAfterVisit")}
              </h2>
              <ul className={classes.visits}>
                {recent.map((v) => (
                  <li key={v._id} className={classes.visit}>
                    <div className={classes.visitHead}>
                      <DoctorAvatar doctor={v.doctor} size="2.5rem" />
                      <div className={classes.doctorText}>
                        <strong>{doctorName(v.doctor) || "—"}</strong>
                        <span>{safeFormatDate(fmt.full, v.date)}</span>
                      </div>
                    </div>
                    {v.instructions ? (
                      <div className={classes.instructions}>
                        <span className={classes.aiLabel}>{getContent("phDoctorInstructions")}</span>
                        <p>{v.instructions}</p>
                      </div>
                    ) : (
                      <span className={classes.muted}>{getContent("phNoInstructions")}</span>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}
          {rebook.length > 0 && (
            <section className={classes.card} aria-labelledby="ph-rebook">
              <h2 id="ph-rebook" className={classes.cardTitle}>
                {getContent("phRebook")}
              </h2>
              <ul className={classes.rebook}>
                {rebook.map((r) => (
                  <li key={r.doctor._id}>
                    <div className={classes.rebookRow}>
                      <DoctorAvatar doctor={r.doctor} size="2.75rem" />
                      <div className={classes.doctorText}>
                        <strong>{doctorName(r.doctor) || "—"}</strong>
                        <span>{getContent("phLastVisit", [safeFormatDate(fmt.full, r.lastVisit)])}</span>
                      </div>
                      {r.doctor.slug && (
                        <Link href={`/dr/${r.doctor.slug}`} className={classes.ghost}>
                          {getContent("phBookAgain")}
                        </Link>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}

      <h2 id="health" className={classes.sectionTitle}>
        {getContent("phHealthProfile")}
      </h2>
    </div>
  );
};

export default PatientHome;
