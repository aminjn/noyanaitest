"use client";
import { ReactNode, useMemo } from "react";
import { addDaysYmd, tehranNoon, tehranTodayYmd, TEHRAN_TZ } from "@/Components/helpers/tehranTime";
import { useIntlLocale } from "@/Components/i18n/navigation";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import Ixon from "@/Components/UI/Ixon";
import ArrowLeftIcon from "@/Components/Icons/ArrowLeftIcon";
import { DoctorHoliday } from "./useDoctorHolidays";
import classes from "./HolidaySection.module.css";

const NS: ContentNamespace[] = ["common", "doctorPanelShift"];

// how far the calendar reaches (the holidays list covers the coming year)
const DAYS_AHEAD = 365;

type Month = { key: string; label: string; days: string[] };

// first day of the week and the weekend of the reader's locale (Intl
// weekInfo where the browser has it; Saturday / Friday, Iran's, otherwise)
const weekOf = (tag: string): { first: number; weekend: number[] } => {
  try {
    const info = (new Intl.Locale(tag) as unknown as { weekInfo?: { firstDay: number; weekend: number[] } }).weekInfo;
    if (info?.firstDay) return { first: info.firstDay % 7, weekend: info.weekend.map((d) => d % 7) };
  } catch {
    /* older browsers */
  }
  return { first: 6, weekend: [5] };
};

// A month grid of the coming year in the reader's own calendar (the
// Persian calendar for Persian readers), official holidays marked closed or
// open, today ringed, the weekend tinted - the wall calendar an Iranian
// practice keeps (Doctolib Pro's calendar view; time.ir's red days).
// Tapping a holiday picks it in the list under the grid.
const HolidayCalendar = ({
  holidays,
  month,
  onMonth,
  onPick,
  children,
}: {
  holidays: DoctorHoliday[];
  month: number;
  onMonth: (i: number) => void;
  onPick: (ymd: string) => void;
  // what goes under the grid, given the shown month's days (its holidays)
  children: (days: Set<string>) => ReactNode;
}) => {
  const getContent = useScopedLocale(NS);
  const intlTag = useIntlLocale();
  const today = tehranTodayYmd();
  const { months, week, dayNum, weekdays } = useMemo(() => {
    const parts = new Intl.DateTimeFormat(`${intlTag}-u-nu-latn`, { timeZone: TEHRAN_TZ, year: "numeric", month: "numeric" });
    // "Aban 1405": month then year, whatever order the locale's pattern has
    const labelFmt = new Intl.DateTimeFormat(intlTag, { timeZone: TEHRAN_TZ, year: "numeric", month: "long" });
    const label = {
      format: (d: Date) => {
        const ps = labelFmt.formatToParts(d);
        const mo = ps.find((x) => x.type === "month")?.value;
        const yr = ps.find((x) => x.type === "year")?.value;
        return mo && yr ? `${mo} ${yr}` : labelFmt.format(d);
      },
    };
    const dayNum = new Intl.DateTimeFormat(intlTag, { timeZone: TEHRAN_TZ, day: "numeric" });
    const keyOf = (ymd: string) => parts.format(tehranNoon(ymd));
    // back to the first day of this month, then a year of days by month
    let start = today;
    for (let i = 0; i < 31 && keyOf(addDaysYmd(start, -1)) === keyOf(today); i++) start = addDaysYmd(start, -1);
    const out: Month[] = [];
    for (let i = 0; i <= DAYS_AHEAD + 31; i++) {
      const ymd = addDaysYmd(start, i);
      const key = keyOf(ymd);
      let m = out[out.length - 1];
      if (!m || m.key !== key) {
        if (i > DAYS_AHEAD) break;
        m = { key, label: label.format(tehranNoon(ymd)), days: [] };
        out.push(m);
      }
      m.days.push(ymd);
    }
    const week = weekOf(intlTag);
    const wd = new Intl.DateTimeFormat(intlTag, { timeZone: TEHRAN_TZ, weekday: "narrow" });
    // a known Sunday (2026-10-11), then the week from its first day
    const weekdays = Array.from({ length: 7 }, (_, i) => {
      const dow = (week.first + i) % 7;
      return { dow, label: wd.format(tehranNoon(addDaysYmd("2026-10-11", dow))) };
    });
    return { months: out, week, dayNum, weekdays };
  }, [intlTag, today]);

  const byDay = useMemo(() => new Map(holidays.map((h) => [h.ymd, h])), [holidays]);
  const i = Math.min(Math.max(0, month), months.length - 1);
  const m = months[i];
  if (!m) return null;
  const lead = (tehranNoon(m.days[0]).getUTCDay() - week.first + 7) % 7;
  const count = m.days.filter((d) => byDay.has(d)).length;
  const shown = new Set(m.days);

  return (
    <div className={classes.cal}>
      <div className={classes.calHead}>
        <button
          type="button"
          className={classes.calNav}
          aria-label={getContent("holCalPrev")}
          disabled={i === 0}
          onClick={() => onMonth(i - 1)}
        >
          <Ixon width="1rem" className={classes.calBack}>
            <ArrowLeftIcon />
          </Ixon>
        </button>
        <strong className={classes.calTitle}>
          {m.label}
          <small>{count ? getContent("holCalCount", [new Intl.NumberFormat(intlTag).format(count)]) : getContent("holCalNone")}</small>
        </strong>
        <button
          type="button"
          className={classes.calNav}
          aria-label={getContent("holCalNext")}
          disabled={i === months.length - 1}
          onClick={() => onMonth(i + 1)}
        >
          <Ixon width="1rem">
            <ArrowLeftIcon />
          </Ixon>
        </button>
      </div>
      <div className={classes.calGrid} role="grid" aria-label={m.label}>
        {weekdays.map((w) => (
          <span key={w.dow} className={`${classes.calWd} ${week.weekend.includes(w.dow) ? classes.calWeekend : ""}`} role="columnheader">
            {w.label}
          </span>
        ))}
        {Array.from({ length: lead }, (_, k) => (
          <span key={`l${k}`} aria-hidden />
        ))}
        {m.days.map((ymd) => {
          const h = byDay.get(ymd);
          const past = ymd < today;
          const weekend = week.weekend.includes(tehranNoon(ymd).getUTCDay());
          const cls = [
            classes.calDay,
            past ? classes.calPast : "",
            weekend ? classes.calWeekend : "",
            ymd === today ? classes.calToday : "",
            h ? (h.closed ? classes.calClosed : classes.calOpen) : "",
          ].join(" ");
          return h ? (
            <button key={ymd} type="button" className={cls} title={h.title} onClick={() => onPick(ymd)}>
              {dayNum.format(tehranNoon(ymd))}
            </button>
          ) : (
            <span key={ymd} className={cls}>
              {dayNum.format(tehranNoon(ymd))}
            </span>
          );
        })}
      </div>
      <div className={classes.calLegend}>
        <span><i className={classes.calClosed} aria-hidden />{getContent("holCalLegendClosed")}</span>
        <span><i className={classes.calOpen} aria-hidden />{getContent("holCalLegendOpen")}</span>
      </div>
      {children(shown)}
    </div>
  );
};

export default HolidayCalendar;
