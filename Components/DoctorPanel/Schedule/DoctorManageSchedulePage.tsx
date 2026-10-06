"use client";
import { useIntlLocale } from "@/Components/i18n/navigation";

import useSWR from "swr";
import classes from "./DoctorManageSchedulePage.module.css";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import useBreadCrump from "@/Components/Hooks/useBreadCrump";
import { IBooking } from "../Calendar/DoctorCalendarDay";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "@/Components/i18n/Link";
import { IReservation } from "@/Components/Dashboard/Booking/DashboardManageBookingsPage";
import ReservationStatusBadge from "@/Components/Dashboard/Booking/ReservationStatusBadge";
import { getSessionDateKey } from "@/Components/helpers/lib";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import { ContentKey } from "@/Components/Enums/contentKeys";
import AssistantStrip from "@/Components/UI/AssistantStrip";
import InitialAvatar from "@/Components/UI/InitialAvatar";
import Ixon from "@/Components/UI/Ixon";
import SearchIcon from "@/Components/Icons/SearchIcon";
import SparkIcon from "@/Components/Icons/SparkIcon";
import Button from "@/Components/UI/Button";
import usePopup from "@/Components/Hooks/usePopup";
import useDoctorAcl from "@/Components/Hooks/useDoctorAcl";
import DeskBookingPopup from "../Desk/DeskBookingPopup";
import VisitQuickActions, { visitActions } from "../Desk/VisitQuickActions";
import PlusIcon from "@/Components/Icons/PlusIcon";
import ClockIcon from "@/Components/Icons/ClockIcon";
import { formatPhone } from "../Desk/deskShared";

const NS: ContentNamespace[] = ["common", "doctorPanelSchedule"];

export type IScheduleBooking = IBooking<{
  Session: { Clinic: Record<string, never> };
  User: true;
  Patient: Record<string, never>;
}>;

export type IScheduleReservation = IReservation<{
  User: Record<never, never>;
  Patient: Record<never, never>;
  Office: Record<never, never>;
}>;

type ScheduleInsights = {
  noShowHistory?: Record<string, { missed: number; visits: number }>;
  intakes?: Record<string, boolean> | null;
};

// One row of the list, from either system: Bookings (System A, clinic
// sessions) and Reservations (System B) - see AUDIT/FIXES_TODO.md F-01.
type Row = {
  id: string;
  kind: "booking" | "reservation";
  dateKey: string;
  start: number;
  end: number;
  name: string;
  phone: string;
  type: string;
  place?: string;
  href: string;
  status?: IScheduleReservation["status"];
  open: boolean;
  missed: number;
  intake: "filled" | "missing" | null;
  desk: boolean;
  // the raw visit, for the arrival buttons
  visit?: IScheduleReservation;
};

const TABS = ["today", "upcoming", "past", "cancelled", "all"] as const;
type Tab = (typeof TABS)[number];
const tabKeys: Record<Tab, ContentKey> = {
  today: "schTabToday",
  upcoming: "schTabUpcoming",
  past: "schTabPast",
  cancelled: "schTabCancelled",
  all: "schTabAll",
};

const DoctorManageSchedulePage = () => {
  const intlTag = useIntlLocale();
  const num = useMemo(() => new Intl.NumberFormat(intlTag), [intlTag]);
  const { data, error, mutate } = useSWR<{
    bookings: IScheduleBooking[];
    reservations: IScheduleReservation[];
    insights?: ScheduleInsights;
  }>(`${API}/doctor/schedule`, (url: string) => fetcher({ url }).then((res) => res.data));
  const { setPopup } = usePopup();
  const hasAccess = useDoctorAcl();

  const getContent = useScopedLocale(NS);
  const [tab, setTab] = useState<Tab>("upcoming");
  // the agenda opens on today when there is something today (Doctolib's
  // day view), otherwise on what is coming
  const tabPicked = useRef(false);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"" | "risk" | "noIntake">("");

  useBreadCrump([
    { title: getContent("dashboard"), target: "/doctorpanel" },
    { title: getContent("schedule"), target: "/doctorpanel/schedule" },
  ]);

  const time = (minutes: number) => {
    const two = (n: number) => num.format(n).padStart(2, num.format(0));
    return `${two(Math.floor(minutes / 60))}:${two(minutes % 60)}`;
  };

  const todayKey = getSessionDateKey(new Date());

  const rows = useMemo<Row[]>(() => {
    if (!data) return [];
    const history = data.insights?.noShowHistory || {};
    const intakes = data.insights?.intakes;
    const out: Row[] = [];
    for (const b of Array.isArray(data.bookings) ? data.bookings : []) {
      if (!b?.session) continue;
      out.push({
        id: b._id,
        kind: "booking",
        dateKey: b.session.date,
        start: b.session.start,
        end: b.session.end,
        name: [b.patient?.givenName, b.patient?.lastName].filter(Boolean).join(" ") || "—",
        phone: b.user?.phone || "",
        type: "",
        place: b.session.clinic?.name,
        href: `/doctorpanel/calendar/${new Date(b.session.date).getTime()}`,
        open: b.session.date >= todayKey,
        missed: 0,
        intake: null,
        desk: false,
      });
    }
    for (const r of Array.isArray(data.reservations) ? data.reservations : []) {
      if (!r || typeof r.start !== "number") continue;
      const dateKey = getSessionDateKey(new Date(r.date));
      const open = dateKey >= todayKey && ["pending", "active"].includes(r.status);
      const userId = (r.user as { _id?: string } | undefined)?._id || "";
      out.push({
        id: r._id,
        kind: "reservation",
        dateKey,
        start: r.start,
        end: r.end,
        name: [r.patient?.givenName, r.patient?.lastName].filter(Boolean).join(" ") || "—",
        phone: r.user?.phone || "",
        type: r.sessionType ? getContent(r.sessionType as ContentKey) : "",
        // an online visit has no office
        place: r.sessionType === "inPerson" ? r.office?.name : undefined,
        href: `/doctorpanel/booking/${r._id}`,
        status: r.status,
        open,
        missed: open ? history[userId]?.missed || 0 : 0,
        intake: open && intakes ? (intakes[r._id] ? "filled" : "missing") : null,
        desk: (r as { source?: string }).source === "desk",
        visit: r,
      });
    }
    return out.sort((a, b) => (a.dateKey === b.dateKey ? a.start - b.start : a.dateKey < b.dateKey ? -1 : 1));
  }, [data, getContent, todayKey]);

  const counts = useMemo(
    () => ({
      today: rows.filter((r) => r.dateKey === todayKey).length,
      // "upcoming" = still ahead (pending / in progress); a visit that is
      // over (completed, no-show, cancelled...) is "past" even if it was today
      upcoming: rows.filter((r) => r.open).length,
      past: rows.filter((r) => !r.open && r.status !== "cancelled").length,
      // a cancelled visit gets its own tab instead of sitting among the
      // past ones (often with a date that is still ahead)
      cancelled: rows.filter((r) => r.status === "cancelled").length,
      all: rows.length,
      risk: rows.filter((r) => r.missed > 0).length,
      noIntake: rows.filter((r) => r.intake === "missing").length,
    }),
    [rows, todayKey],
  );

  useEffect(() => {
    if (tabPicked.current || !data) return;
    tabPicked.current = true;
    if (counts.today > 0) setTab("today");
  }, [counts.today, data]);

  // today at a glance: done / waiting / missed, and who is next
  const nowMin = (() => {
    const d = new Date();
    return d.getHours() * 60 + d.getMinutes();
  })();
  const todayRows = rows.filter((r) => r.dateKey === todayKey && r.kind === "reservation");
  const summary = {
    done: todayRows.filter((r) => r.status === "completed").length,
    waiting: todayRows.filter((r) => r.open).length,
    missed: todayRows.filter((r) => r.status === "noShow").length,
    cancelled: todayRows.filter((r) => r.status === "cancelled").length,
  };
  const next = todayRows.filter((r) => r.open).sort((a, b) => a.start - b.start)[0];
  const openDesk = () => setPopup("DeskBooking", <DeskBookingPopup onDone={() => mutate()} />);

  const days = useMemo(() => {
    const q = query.trim().toLowerCase();
    const visible = rows.filter((r) => {
      if (filter === "risk" && r.missed <= 0) return false;
      if (filter === "noIntake" && r.intake !== "missing") return false;
      if (!filter) {
        if (tab === "today" && r.dateKey !== todayKey) return false;
        if (tab === "upcoming" && !r.open) return false;
        if (tab === "past" && (r.open || r.status === "cancelled")) return false;
        if (tab === "cancelled" && r.status !== "cancelled") return false;
      }
      if (q && !`${r.name} ${r.phone}`.toLowerCase().includes(q)) return false;
      return true;
    });
    if (tab === "past" && !filter) visible.reverse();
    const map = new Map<string, Row[]>();
    for (const r of visible) {
      if (!map.has(r.dateKey)) map.set(r.dateKey, []);
      map.get(r.dateKey)?.push(r);
    }
    const weekday = new Intl.DateTimeFormat(intlTag, { weekday: "long" });
    const date = new Intl.DateTimeFormat(intlTag, { day: "numeric", month: "long", year: "numeric" });
    return Array.from(map.entries()).map(([key, list]) => {
      const d = new Date(key);
      return { key, list, weekday: weekday.format(d), date: date.format(d), isToday: key === todayKey };
    });
  }, [rows, filter, tab, query, todayKey, intlTag]);

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <div className={classes.main}>
          <header className={classes.header}>
            <h1 className={classes.title}>{getContent("schedule")}</h1>
            <div className={classes.headActions}>
              {hasAccess("readShifts") && (
                <Button href="/doctorpanel/shift" variant="Neutral" mode="Outline" size="M" leadIcon={<ClockIcon />}>
                  {getContent("schWorkingHours")}
                </Button>
              )}
              {hasAccess("mutateCalendar") && (
                <Button size="M" leadIcon={<PlusIcon />} onClick={openDesk}>
                  {getContent("deskNewBooking")}
                </Button>
              )}
            </div>
            <div className={classes.tabs} role="tablist">
              {TABS.map((t) => (
                <button
                  key={t}
                  type="button"
                  role="tab"
                  aria-selected={!filter && tab === t}
                  className={`${classes.tab} ${!filter && tab === t ? classes.tabOn : ""}`}
                  onClick={() => {
                    setTab(t);
                    setFilter("");
                  }}
                >
                  {getContent(tabKeys[t])}
                  <span className={classes.tabCount}>{num.format(counts[t])}</span>
                </button>
              ))}
            </div>
            <label className={classes.search}>
              <Ixon width="1.05rem">
                <SearchIcon />
              </Ixon>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={getContent("schSearch")}
                aria-label={getContent("schSearch")}
              />
            </label>
          </header>

          {tab === "today" && !filter && todayRows.length > 0 && (
            <section className={classes.todayPanel}>
              <ul className={classes.summary}>
                <li className="tone-teal">{getContent("schSumDone", [num.format(summary.done)])}</li>
                <li className="tone-indigo">{getContent("schSumWaiting", [num.format(summary.waiting)])}</li>
                {summary.missed > 0 && <li className="tone-rose">{getContent("schSumMissed", [num.format(summary.missed)])}</li>}
                {summary.cancelled > 0 && <li className="glassIcon tone-muted">{getContent("schSumCancelled", [num.format(summary.cancelled)])}</li>}
              </ul>
              {next ? (
                <div className={classes.next}>
                  <span className={classes.nextLabel}>{getContent("schNextPatient")}</span>
                  <Link href={next.href} className={classes.nextWho}>
                    <InitialAvatar name={next.name} seed={next.id} size="2.75rem" />
                    <span>
                      <strong>{next.name}</strong>
                      <small>
                        {[time(next.start), next.type, next.place].filter(Boolean).join(" · ")}
                      </small>
                    </span>
                  </Link>
                  <span className={classes.nextActions}>
                    {next.visit && (
                      <VisitQuickActions visit={next.visit} name={next.name} onDone={() => mutate()} size="M" />
                    )}
                    <Button href={next.href} size="M" variant="Neutral" mode="Outline">
                      {getContent("schOpenVisit")}
                    </Button>
                  </span>
                </div>
              ) : (
                <p className={classes.nextNone}>{getContent("schNoMoreToday")}</p>
              )}
            </section>
          )}

          <AssistantStrip
            title={getContent("schAssistant")}
            clearLabel={getContent("schClearFilter")}
            onClear={() => setFilter("")}
            chips={[
              ...(counts.risk
                ? [
                    {
                      key: "risk",
                      label: getContent("schAiRisk", [num.format(counts.risk)]),
                      active: filter === "risk",
                      onClick: () => setFilter(filter === "risk" ? "" : "risk"),
                    },
                  ]
                : []),
              ...(counts.noIntake
                ? [
                    {
                      key: "noIntake",
                      label: getContent("schAiNoIntake", [num.format(counts.noIntake)]),
                      active: filter === "noIntake",
                      onClick: () => setFilter(filter === "noIntake" ? "" : "noIntake"),
                    },
                  ]
                : []),
            ]}
          />

          {!days.length && (
            <div className={classes.empty}>
              {rows.length ? getContent("schEmptyFiltered") : getContent("nothingFound")}
            </div>
          )}

          {days.map((day) => (
            <section key={day.key} className={classes.day}>
              <div className={classes.dayHead}>
                <span className={`${classes.dayName} ${day.isToday ? classes.today : ""}`}>{day.weekday}</span>
                <span className={classes.dayDate}>{day.date}</span>
                <span className={classes.dayCount}>{getContent("schCount", [num.format(day.list.length)])}</span>
              </div>
              <ul className={classes.rows}>
                {day.list.map((r, i) => {
                  // a free stretch of at least half an hour between two
                  // open visits today: bookable straight from here
                  const prev = day.list[i - 1];
                  const gapFrom = prev ? prev.end : 0;
                  const showGap =
                    day.isToday &&
                    tab === "today" &&
                    !filter &&
                    !query &&
                    !!prev &&
                    r.open &&
                    r.start - gapFrom >= 30 &&
                    r.start > nowMin &&
                    hasAccess("mutateCalendar");
                  const showNow =
                    day.isToday && tab === "today" && !filter && (!prev || prev.start <= nowMin) && r.start > nowMin;
                  const quick = r.visit ? visitActions(r.visit) : null;
                  return (
                    <li key={`${r.kind}-${r.id}`} className={classes.item}>
                      {showNow && (
                        <span className={classes.nowLine}>
                          <span>{getContent("schNow", [time(nowMin)])}</span>
                        </span>
                      )}
                      {showGap && (
                        <button type="button" className={classes.gap} onClick={openDesk}>
                          <Ixon width="0.875rem">
                            <PlusIcon />
                          </Ixon>
                          {getContent("schFreeGap", [time(Math.max(gapFrom, nowMin)), time(r.start)])}
                        </button>
                      )}
                      <div
                        className={`${classes.row} ${r.open ? "" : classes.closed} ${next && next.id === r.id ? classes.isNext : ""}`}
                      >
                        <Link href={r.href} className={classes.rowMain}>
                          <span className={classes.time}>
                            <strong>{time(r.start)}</strong>
                            <span>{time(r.end)}</span>
                          </span>
                          <InitialAvatar name={r.name} seed={r.id} />
                          <span className={classes.who}>
                            <strong>{r.name}</strong>
                            {!!r.phone && <span className={classes.phone}>{formatPhone(r.phone)}</span>}
                          </span>
                          <span className={classes.kind}>
                            {[r.type, r.place, r.desk ? getContent("deskPayAtDesk") : ""].filter(Boolean).join(" · ")}
                          </span>
                          <span className={classes.insight}>
                            {r.missed > 0 ? (
                              <span className={classes.risk}>
                                <Ixon width="0.8rem">
                                  <SparkIcon />
                                </Ixon>
                                {getContent("schMissed", [num.format(r.missed)])}
                              </span>
                            ) : r.intake === "filled" ? (
                              <span className={classes.ready}>
                                <Ixon width="0.8rem">
                                  <SparkIcon />
                                </Ixon>
                                {getContent("schIntakeFilled")}
                              </span>
                            ) : r.intake === "missing" ? (
                              <span className={classes.muted}>{getContent("schIntakeMissing")}</span>
                            ) : null}
                          </span>
                          <span className={classes.status}>
                            {r.status && <ReservationStatusBadge status={r.status} />}
                          </span>
                        </Link>
                        {!!r.visit && !!quick && (quick.checkIn || quick.noShow || quick.arrived) && (
                          <span className={classes.quick}>
                            <VisitQuickActions visit={r.visit} name={r.name} onDone={() => mutate()} />
                          </span>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}
    </HandleLoading>
  );
};

export default DoctorManageSchedulePage;
