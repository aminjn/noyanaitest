"use client";
import { useMemo } from "react";
import { addDaysYmd, tehranNoon, TEHRAN_TZ } from "@/Components/helpers/tehranTime";
import { useIntlLocale } from "@/Components/i18n/navigation";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import Ixon from "@/Components/UI/Ixon";
import ArrowLeftIcon from "@/Components/Icons/ArrowLeftIcon";
import { HoursDay } from "./useHoursSummary";
import classes from "./HoursCalendar.module.css";

const NS: ContentNamespace[] = ["common", "doctorPanelShift"];

// how far back (the agenda keeps three months) and ahead (the holidays
// list covers the coming year) the calendar goes
const DAYS_BACK = 92;
const DAYS_AHEAD = 365;

export type CalendarMonth = { key: string; label: string; days: string[] };

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

// The months of the reader's own calendar (the Persian calendar for a
// Persian reader, Intl decides) from three months back to a year ahead,
// each with its Tehran days.
export const useCalendarMonths = (today: string) => {
  const intlTag = useIntlLocale();
  return useMemo(() => {
    const parts = new Intl.DateTimeFormat(`${intlTag}-u-nu-latn`, { timeZone: TEHRAN_TZ, year: "numeric", month: "numeric" });
    const labelFmt = new Intl.DateTimeFormat(intlTag, { timeZone: TEHRAN_TZ, year: "numeric", month: "long" });
    // "Aban 1405": month then year, whatever order the locale's pattern has
    const labelOf = (d: Date) => {
      const ps = labelFmt.formatToParts(d);
      const mo = ps.find((x) => x.type === "month")?.value;
      const yr = ps.find((x) => x.type === "year")?.value;
      return mo && yr ? `${mo} ${yr}` : labelFmt.format(d);
    };
    const keyOf = (ymd: string) => parts.format(tehranNoon(ymd));
    // back to the first day of the month three months ago
    let start = addDaysYmd(today, -DAYS_BACK);
    const startKey = keyOf(start);
    for (let i = 0; i < 31 && keyOf(addDaysYmd(start, -1)) === startKey; i++) start = addDaysYmd(start, -1);
    const months: CalendarMonth[] = [];
    const last = addDaysYmd(today, DAYS_AHEAD);
    for (let ymd = start; ; ymd = addDaysYmd(ymd, 1)) {
      const key = keyOf(ymd);
      let m = months[months.length - 1];
      if (!m || m.key !== key) {
        if (ymd > last) break;
        m = { key, label: labelOf(tehranNoon(ymd)), days: [] };
        months.push(m);
      }
      m.days.push(ymd);
    }
    const todayIndex = Math.max(0, months.findIndex((m) => m.days.includes(today)));
    const week = weekOf(intlTag);
    const wd = new Intl.DateTimeFormat(intlTag, { timeZone: TEHRAN_TZ, weekday: "narrow" });
    // a known Sunday (2026-10-11), then the week from its first day
    const weekdays = Array.from({ length: 7 }, (_, i) => {
      const dow = (week.first + i) % 7;
      return { dow, label: wd.format(tehranNoon(addDaysYmd("2026-10-11", dow))) };
    });
    return { months, todayIndex, week, weekdays };
  }, [intlTag, today]);
};

// The month grid at the heart of «ساعات کاری» (Doctolib Pro's month view;
// time.ir's red days): every day says at a glance whether it is a working
// day, an official holiday (closed / open), a day off, how many visits are
// booked and how many are still free, and today is ringed. Every day is a
// button: it opens the day's panel.
const HoursCalendar = ({
  month,
  days,
  today,
  horizonEnd,
  selected,
  onPick,
  week,
  weekdays,
  loading,
}: {
  month: CalendarMonth;
  days: Map<string, HoursDay>;
  today: string;
  horizonEnd: string | null;
  selected: string | null;
  onPick: (ymd: string) => void;
  week: { first: number; weekend: number[] };
  weekdays: { dow: number; label: string }[];
  loading: boolean;
}) => {
  const getContent = useScopedLocale(NS);
  const intlTag = useIntlLocale();
  const fmt = useMemo(
    () => ({
      day: new Intl.DateTimeFormat(intlTag, { timeZone: TEHRAN_TZ, day: "numeric" }),
      long: new Intl.DateTimeFormat(intlTag, { timeZone: TEHRAN_TZ, weekday: "long", day: "numeric", month: "long" }),
      num: new Intl.NumberFormat(intlTag),
    }),
    [intlTag],
  );
  const lead = (tehranNoon(month.days[0]).getUTCDay() - week.first + 7) % 7;

  return (
    <div className={`${classes.grid} ${loading ? classes.gridLoading : ""}`} role="grid" aria-label={month.label} aria-busy={loading}>
      {weekdays.map((w) => (
        <span key={w.dow} className={`${classes.wd} ${week.weekend.includes(w.dow) ? classes.weekend : ""}`} role="columnheader">
          {w.label}
        </span>
      ))}
      {Array.from({ length: lead }, (_, k) => (
        <span key={`l${k}`} aria-hidden />
      ))}
      {month.days.map((ymd) => {
        const d = days.get(ymd);
        const at = tehranNoon(ymd);
        const past = ymd < today;
        const beyond = !!horizonEnd && ymd > horizonEnd;
        const wholeOff = !!d?.timeOff?.some((t) => typeof t.startMin !== "number");
        const someHoursOff = !wholeOff && !!d?.timeOff?.length;
        const closedHoliday = !!d?.holiday?.closed;
        const off = !!d && (!d.working || closedHoliday || wholeOff);
        const cls = [
          classes.day,
          past ? classes.past : "",
          week.weekend.includes(at.getUTCDay()) ? classes.weekend : "",
          ymd === today ? classes.today : "",
          ymd === selected ? classes.selected : "",
          d ? (off ? classes.off : classes.working) : "",
          d?.holiday ? (closedHoliday ? classes.holClosed : classes.holOpen) : "",
          wholeOff ? classes.timeOff : someHoursOff ? classes.someOff : "",
        ].join(" ");
        // what a screen reader (and the hover title) says about the day
        const said = [
          fmt.long.format(at),
          ymd === today ? getContent("today") : "",
          d?.holiday
            ? `${getContent("holDayLabel", [d.holiday.title])} · ${getContent(d.holiday.closed ? "holClosed" : "holOpen")}${d.holiday.estimated ? ` · ${getContent("hcEstimated")}` : ""}`
            : "",
          wholeOff ? getContent("hcLegendTimeOff") : someHoursOff ? getContent("hcSomeHoursOff") : "",
          d && !d.working && !d.holiday && !wholeOff ? getContent("offDay") : "",
          d && d.booked ? getContent("xSessions", [fmt.num.format(d.booked)]) : "",
          d && d.free !== null && d.slots ? getContent("hcFreeOf", [fmt.num.format(d.free), fmt.num.format(d.slots)]) : "",
          beyond && d?.working ? getContent("hcBeyondHorizon") : "",
        ]
          .filter(Boolean)
          .join(" · ");
        const fill = d && d.slots ? Math.min(100, Math.round(((d.slots - (d.free ?? d.slots - d.booked)) / d.slots) * 100)) : 0;
        return (
          <button
            key={ymd}
            type="button"
            role="gridcell"
            aria-selected={ymd === selected}
            aria-label={said}
            title={said}
            className={cls}
            onClick={() => onPick(ymd)}
          >
            <span className={classes.num}>{fmt.day.format(at)}</span>
            {!!d?.holiday && <span className={classes.holTitle}>{d.holiday.title}</span>}
            <span className={classes.meta}>
              {!!d && d.booked > 0 && <span className={classes.booked}>{fmt.num.format(d.booked)}</span>}
              {!!d && d.free !== null && d.slots > 0 && !off && (
                <span className={classes.free}>
                  {getContent("hcFreeOf", [fmt.num.format(d.free), fmt.num.format(d.slots)])}
                </span>
              )}
            </span>
            {!!d && d.slots > 0 && !off && d.free !== null && (
              <span className={classes.bar} aria-hidden>
                <i style={{ inlineSize: `${fill}%` }} />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export const MonthNav = ({
  label,
  onPrev,
  onNext,
  onToday,
  canPrev,
  canNext,
  isCurrent,
  children,
}: {
  label: string;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  canPrev: boolean;
  canNext: boolean;
  isCurrent: boolean;
  children?: React.ReactNode;
}) => {
  const getContent = useScopedLocale(NS);
  return (
    <div className={classes.nav}>
      <button type="button" className={classes.navBtn} aria-label={getContent("hcPrevMonth")} title={getContent("hcPrevMonth")} disabled={!canPrev} onClick={onPrev}>
        <Ixon width="1rem" className={classes.back}>
          <ArrowLeftIcon />
        </Ixon>
      </button>
      <strong className={classes.navTitle} aria-live="polite">
        {label}
        {children}
      </strong>
      <button type="button" className={classes.navBtn} aria-label={getContent("hcNextMonth")} title={getContent("hcNextMonth")} disabled={!canNext} onClick={onNext}>
        <Ixon width="1rem">
          <ArrowLeftIcon />
        </Ixon>
      </button>
      {!isCurrent && (
        <button type="button" className={classes.todayBtn} onClick={onToday}>
          {getContent("today")}
        </button>
      )}
    </div>
  );
};

export const CalendarLegend = () => {
  const getContent = useScopedLocale(NS);
  const intlTag = useIntlLocale();
  return (
    <div className={classes.legend}>
      <span><i className={classes.lgWorking} aria-hidden />{getContent("hcLegendWorking")}</span>
      <span><i className={classes.lgOff} aria-hidden />{getContent("offDay")}</span>
      <span><i className={classes.lgHolClosed} aria-hidden />{getContent("holCalLegendClosed")}</span>
      <span><i className={classes.lgHolOpen} aria-hidden />{getContent("holCalLegendOpen")}</span>
      <span><i className={classes.lgTimeOff} aria-hidden />{getContent("hcLegendTimeOff")}</span>
      <span><b className={classes.lgBooked} aria-hidden>{new Intl.NumberFormat(intlTag).format(2)}</b>{getContent("hcLegendBooked")}</span>
    </div>
  );
};

export default HoursCalendar;
