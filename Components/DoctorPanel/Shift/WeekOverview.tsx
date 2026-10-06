"use client";

import { useMemo } from "react";
import classes from "./WeekOverview.module.css";
import { numberToTime } from "../Calendar/AddSessionsAgent";
import { ShiftContext } from "./DoctorManageShiftsPage";

export type HourAxis = {
  from: number;
  to: number;
  span: number;
  hours: number[];
  pct: (minutes: number) => string;
};

// One hour axis for the whole week (Doctolib / Practo-style week map): the
// week's earliest start to latest end in whole hours, at least 8:00-20:00 so
// an empty week still reads as a day.
export const useHourAxis = (live: ShiftContext): HourAxis =>
  useMemo(() => {
    const valid = live.filter((s) => typeof s.start === "number" && typeof s.end === "number" && s.end > s.start);
    const min = Math.min(8 * 60, ...valid.map((s) => s.start));
    const max = Math.max(20 * 60, ...valid.map((s) => s.end));
    const from = Math.floor(min / 60) * 60;
    const to = Math.ceil(max / 60) * 60;
    const span = Math.max(to - from, 60);
    const step = span > 12 * 60 ? 3 : 2;
    const hours: number[] = [];
    for (let h = from / 60; h <= to / 60; h += step) hours.push(h);
    return { from, to, span, hours, pct: (m: number) => `${((m - from) / span) * 100}%` };
  }, [live]);

// A day's ranges as bars on the shared axis, tinted by office.
const DayTrack = ({
  shifts,
  axis,
  toneOf,
  off,
}: {
  shifts: ShiftContext;
  axis: HourAxis;
  toneOf: (officeId?: string) => string;
  off?: boolean;
}) => (
  <span className={`${classes.track} ${off ? classes.off : ""}`} aria-hidden>
    {axis.hours.map((h) => (
      <span key={h} className={classes.gridLine} style={{ insetInlineStart: axis.pct(h * 60) }} />
    ))}
    {!off &&
      shifts
        .filter((s) => s.end > s.start)
        .map((s, i) => (
          <span
            key={`${s._id || i}`}
            className={`${classes.bar} ${toneOf(s.office)}`}
            style={{
              insetInlineStart: axis.pct(Math.max(s.start, axis.from)),
              width: `${((Math.min(s.end, axis.to) - Math.max(s.start, axis.from)) / axis.span) * 100}%`,
            }}
            title={`${numberToTime(s.start)}–${numberToTime(s.end)}`}
          />
        ))}
  </span>
);

export default DayTrack;
