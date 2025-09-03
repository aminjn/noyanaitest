import React, {
  Dispatch,
  Fragment,
  ReactNode,
  SetStateAction,
  useEffect,
  useMemo,
  useState,
} from "react";
import classes from "./Calendxr.module.css";
import {
  CalendxrClassName,
  DEFAULT_PERSIAN_WEEKDAYS,
  fromJalali,
  inRange,
  isSameDay,
  jalaliMonthLength,
  mod,
  PERSIAN_MONTHS,
  SelectionMode,
  toJalali,
  weekdayOfJalaliFirst,
} from "./CalendxrLib";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

export type JalaliCalendarProps = {
  classNames?: Partial<Record<CalendxrClassName, string>>;
  initialMonth?: { jy: number; jm: number };
  value?: Date | Date[] | { start: Date | null; end: Date | null };
  onChange?: (val: JalaliCalendarProps["value"]) => void;
  selectionMode?: SelectionMode;
  renderHeader?: (ctx: {
    jy: number;
    jm: number;
    goPrevMonth: () => void;
    goNextMonth: () => void;
    setView: Dispatch<SetStateAction<CalendxrView>>;
  }) => ReactNode;
  renderDay?: (ctx: {
    jy: number;
    jm: number;
    jd: number;
    date: Date;
    selected: boolean;
    inRange?: boolean;
    rangeStart?: boolean;
    rangeEnd?: boolean;
    disabled: boolean;
    onSelect: () => void;
  }) => ReactNode;
  renderWeekDay?: (index: number, view: CalendxrView) => ReactNode;
};

export type CalendxrView = { jy: number; jm: number };

export default function Calendxr({
  initialMonth,
  value,
  classNames,
  onChange,
  selectionMode = "single",
  renderHeader,
  renderDay,
  renderWeekDay,
}: JalaliCalendarProps) {
  const todayJ = toJalali(new Date());
  const [view, setView] = useState<CalendxrView>(
    initialMonth ?? { jy: todayJ.jy, jm: todayJ.jm }
  );

  const [internal, setInternal] = useState<
    Date | Date[] | { start: Date | null; end: Date | null }
  >(
    value ??
      (selectionMode === "range"
        ? { start: null, end: null }
        : selectionMode === "multiple"
        ? []
        : new Date())
  );

  useEffect(() => {
    if (value !== undefined) setInternal(value);
  }, [value]);

  const { days, weekStartOffset } = useMemo(() => {
    const firstWeekday = weekdayOfJalaliFirst(view.jy, view.jm) + 1;
    const weekStartOffset = mod(firstWeekday, 7);
    const len = jalaliMonthLength(view.jy, view.jm);
    const days = Array.from({ length: len }, (_, i) => {
      const jd = i + 1;
      const date = dayjs(fromJalali(view.jy, view.jm, jd)).utc(true).toDate();
      return { jd, date };
    });
    return { days, weekStartOffset };
  }, [view]);

  const goPrevMonth = () =>
    setView((prev) => {
      let { jy, jm } = prev;
      jm -= 1;
      if (jm < 1) {
        jm = 12;
        jy -= 1;
      }
      return { jy, jm };
    });

  const goNextMonth = () =>
    setView((prev) => {
      let { jy, jm } = prev;
      jm += 1;
      if (jm > 12) {
        jm = 1;
        jy += 1;
      }
      return { jy, jm };
    });

  function handleSelect(date: Date) {
    let next: typeof internal = internal;
    if (selectionMode === "single") next = date;
    else if (selectionMode === "multiple") {
      const arr = Array.isArray(internal) ? [...internal] : [];
      const idx = arr.findIndex((d: Date) => isSameDay(d, date));
      if (idx >= 0) arr.splice(idx, 1);
      else arr.push(date);
      next = arr;
    } else {
      const cur = internal as { start: Date | null; end: Date | null };
      if (!cur.start || (cur.start && cur.end))
        next = { start: date, end: null };
      else {
        if (date < cur.start) next = { start: date, end: cur.start };
        else next = { start: cur.start, end: date };
      }
    }
    setInternal(next);
    onChange?.(next as typeof internal);
  }

  function isSelected(d: Date) {
    if (selectionMode === "single")
      return internal instanceof Date ? isSameDay(internal, d) : false;
    if (selectionMode === "multiple") {
      const arr = Array.isArray(internal) ? internal : [];
      return arr.some((x: Date) => isSameDay(x, d));
    }
    const { start, end } = internal as { start: Date | null; end: Date | null };
    return !!(start && isSameDay(start, d)) || !!(end && isSameDay(end, d));
  }

  function isInRange(d: Date) {
    if (selectionMode !== "range") return false;
    const { start, end } = internal as { start: Date | null; end: Date | null };
    return inRange(d, start, end);
  }

  const header = renderHeader ? (
    renderHeader({
      jy: view.jy,
      jm: view.jm,
      goPrevMonth,
      goNextMonth,
      setView,
    })
  ) : (
    <div className={classes.header}>
      <button type="button" onClick={goPrevMonth} className={classes.nav}>
        ‹
      </button>
      <div className={classes.month}>
        {PERSIAN_MONTHS[view.jm - 1]} {view.jy}
      </div>
      <button type="button" onClick={goNextMonth} className={classes.nav}>
        ›
      </button>
    </div>
  );

  return (
    <div className={`${classes.container} ${classNames?.container || ""}`}>
      {header}
      <div className={`${classes.weekdays} ${classNames?.weekdays || ""}`}>
        {DEFAULT_PERSIAN_WEEKDAYS.map((w, i) => (
          <Fragment key={w}>
            {renderWeekDay ? renderWeekDay(i, view) : <div>{w}</div>}
          </Fragment>
        ))}
      </div>
      <div className={`${classes.days} ${classNames?.daysGrid || ""}`}>
        {Array.from({ length: weekStartOffset }).map((_, i) => (
          <div key={`b-${i}`} />
        ))}
        {days.map(({ jd, date }) => {
          const selected = isSelected(date);
          const inR = isInRange(date);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const rangeCtx = selectionMode === "range" && (internal as any);
          const rangeStart = rangeCtx?.start && isSameDay(rangeCtx.start, date);
          const rangeEnd = rangeCtx?.end && isSameDay(rangeCtx.end, date);
          let clsName = `${classes.day}`;
          if (selected) clsName += ` ${classes.selectedDay}`;
          else if (inR) clsName += ` ${classes.dayInRange}`;
          const dayNode = renderDay ? (
            renderDay({
              jy: view.jy,
              jm: view.jm,
              jd,
              date,
              selected,
              inRange: inR,
              rangeStart,
              rangeEnd,
              disabled: false,
              onSelect: () => handleSelect(date),
            })
          ) : (
            <button
              type="button"
              onClick={() => handleSelect(date)}
              aria-pressed={selected}
            >
              {jd}
            </button>
          );
          return (
            <div key={jd} className={clsName}>
              {dayNode}
            </div>
          );
        })}
      </div>
    </div>
  );
}
