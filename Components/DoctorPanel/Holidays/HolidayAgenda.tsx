"use client";
import { useMemo } from "react";
import { TEHRAN_TZ, tehranNoon } from "@/Components/helpers/tehranTime";
import { useIntlLocale } from "@/Components/i18n/navigation";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import Link from "@/Components/i18n/Link";
import { DoctorHoliday } from "./useDoctorHolidays";
import classes from "./HolidaySection.module.css";

const NS: ContentNamespace[] = ["common", "doctorPanelSchedule"];

// The agenda's view of the official holidays (2026-10, «برنامه زمانی»): the
// coming ones as chips (closed / open) with the way to the hours page, and
// the mark on a day of the list. The list itself is useDoctorHolidays.

export const HolidayAgendaNotice = ({ holidays, manage }: { holidays: DoctorHoliday[]; manage?: boolean }) => {
  const getContent = useScopedLocale(NS);
  const intlTag = useIntlLocale();
  const fmt = useMemo(
    () => new Intl.DateTimeFormat(intlTag, { timeZone: TEHRAN_TZ, weekday: "short", day: "numeric", month: "short" }),
    [intlTag],
  );
  const num = useMemo(() => new Intl.NumberFormat(intlTag), [intlTag]);
  const list = (Array.isArray(holidays) ? holidays : []).slice(0, 6);
  if (!list.length) return null;
  return (
    <section className={classes.notice} aria-label={getContent("holUpcomingTitle")}>
      <div className={classes.noticeHead}>
        <strong>{getContent("holUpcomingTitle")}</strong>
        {manage && (
          <Link href="/doctorpanel/shift#holidays" className={classes.link}>
            {getContent("holManage")}
          </Link>
        )}
      </div>
      <ul className={classes.chips}>
        {list.map((h) => (
          <li key={h.ymd} className={`${classes.chip} ${h.closed ? "" : classes.chipOpen}`} title={h.title}>
            {[
              fmt.format(tehranNoon(h.ymd)),
              getContent(h.closed ? "holClosed" : "holOpen"),
              h.booked > 0 ? getContent("holBooked", [num.format(h.booked)]) : "",
              h.estimated ? getContent("hcEstimated") : "",
            ]
              .filter(Boolean)
              .join(" · ")}
          </li>
        ))}
      </ul>
    </section>
  );
};

export const HolidayDayMark = ({ holiday }: { holiday?: DoctorHoliday | null }) => {
  const getContent = useScopedLocale(NS);
  if (!holiday) return null;
  return (
    <span className={`${classes.dayMark} ${holiday.closed ? "" : classes.dayMarkOpen}`}>
      {[getContent("holDayLabel", [holiday.title]), getContent(holiday.closed ? "holClosed" : "holOpen"), holiday.estimated ? getContent("hcEstimated") : ""]
        .filter(Boolean)
        .join(" · ")}
    </span>
  );
};
