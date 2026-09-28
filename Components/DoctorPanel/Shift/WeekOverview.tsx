"use client";

import { useMemo } from "react";
import classes from "./WeekOverview.module.css";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import { useIntlLocale } from "@/Components/i18n/navigation";
import { numberToTime } from "../Calendar/AddSessionsAgent";
import useShiftUtils from "./useShiftUtils";
import {
  DoctorShiftDay,
  ShiftContext,
  daysOfWeekContentKeys,
  doctorShiftDays,
} from "./DoctorManageShiftsPage";

const NS: ContentNamespace[] = ["common", "doctorPanelShift"];

// Doctolib / Practo-style week map: every day on one hour axis, shifts as
// bars, so gaps and uneven days show at a glance. Clicking a day opens its
// editor tab.
const WeekOverview = ({
  value,
  offDays,
  current,
  onPick,
}: {
  value: ShiftContext;
  offDays: DoctorShiftDay[];
  current: DoctorShiftDay;
  onPick: (day: DoctorShiftDay) => void;
}) => {
  const getContent = useScopedLocale(NS);
  const intlTag = useIntlLocale();
  const num = useMemo(() => new Intl.NumberFormat(intlTag, { maximumFractionDigits: 1 }), [intlTag]);
  const { getShiftSessions } = useShiftUtils();

  const valid = useMemo(
    () => value.filter((s) => typeof s.start === "number" && typeof s.end === "number" && s.end > s.start),
    [value],
  );

  // hour axis: the week's earliest start to latest end, whole hours,
  // at least 8:00-20:00 so an empty week still reads as a day
  const [from, to] = useMemo(() => {
    const live = valid.filter((s) => !offDays.includes(s.day));
    const min = Math.min(8 * 60, ...live.map((s) => s.start));
    const max = Math.max(20 * 60, ...live.map((s) => s.end));
    return [Math.floor(min / 60) * 60, Math.ceil(max / 60) * 60];
  }, [valid, offDays]);
  const span = Math.max(to - from, 60);
  const hours = useMemo(() => {
    const out: number[] = [];
    const step = span > 12 * 60 ? 3 : 2;
    for (let h = from / 60; h <= to / 60; h += step) out.push(h);
    return out;
  }, [from, to, span]);

  const stats = useMemo(() => {
    const live = valid.filter((s) => !offDays.includes(s.day));
    return {
      sessions: live.reduce((a, s) => a + getShiftSessions(s).length, 0),
      days: new Set(live.map((s) => s.day)).size,
      hours: live.reduce((a, s) => a + (s.end - s.start), 0) / 60,
    };
  }, [valid, offDays, getShiftSessions]);

  const pct = (m: number) => `${((m - from) / span) * 100}%`;

  return (
    <section className={classes.main}>
      <header className={classes.head}>
        <strong>{getContent("shWeekTitle")}</strong>
        <div className={classes.stats}>
          <span>{getContent("shWeekSessions", [num.format(stats.sessions)])}</span>
          <span>{getContent("shWorkDays", [num.format(stats.days)])}</span>
          <span>{getContent("shWeekHours", [num.format(stats.hours)])}</span>
        </div>
      </header>

      <div className={classes.grid}>
        <div className={classes.axis} aria-hidden>
          <span className={classes.dayCol} />
          <div className={classes.track}>
            {hours.map((h) => (
              <span key={h} className={classes.tick} style={{ insetInlineStart: pct(h * 60) }}>
                {num.format(h)}
              </span>
            ))}
          </div>
        </div>

        {doctorShiftDays.map((day) => {
          const off = offDays.includes(day);
          const shifts = valid.filter((s) => s.day === day).sort((a, b) => a.start - b.start);
          const count = off ? 0 : shifts.reduce((a, s) => a + getShiftSessions(s).length, 0);
          return (
            <button
              key={day}
              type="button"
              className={`${classes.row} ${current === day ? classes.rowOn : ""} ${off ? classes.off : ""}`}
              onClick={() => onPick(day)}
              aria-pressed={current === day}
            >
              <span className={classes.dayCol}>
                <b>{getContent(daysOfWeekContentKeys[day])}</b>
                <small>
                  {off
                    ? getContent("offDay")
                    : shifts.length
                      ? getContent("xSessions", [num.format(count)])
                      : getContent("shNoShift")}
                </small>
              </span>
              <span className={classes.track}>
                {hours.map((h) => (
                  <span key={h} className={classes.gridLine} style={{ insetInlineStart: pct(h * 60) }} />
                ))}
                {!off &&
                  shifts.map((s, i) => (
                    <span
                      key={`${s._id || i}`}
                      className={classes.bar}
                      style={{ insetInlineStart: pct(s.start), width: `${((s.end - s.start) / span) * 100}%` }}
                      title={`${numberToTime(s.start)}–${numberToTime(s.end)}`}
                    >
                      <span className={classes.barText} dir="ltr">
                        {numberToTime(s.start)}–{numberToTime(s.end)}
                      </span>
                    </span>
                  ))}
              </span>
            </button>
          );
        })}
      </div>
      <p className={classes.hint}>{getContent("shWeekHint")}</p>
    </section>
  );
};

export default WeekOverview;
