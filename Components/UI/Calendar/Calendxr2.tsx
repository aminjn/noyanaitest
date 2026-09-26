import { ContentKey } from "@/Components/Enums/contentKeys";
import {
  Fragment,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import classes from "./Calendxr2.module.css";
import moment from "moment-jalaali";
import Ixon from "../Ixon";
import ChevronIcon from "@/Components/Icons/ChevronIcon";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const LOCALE_NS: ContentNamespace[] = ["common", "uiCalendar"];

export type CalendxrView = { month: number; year: number };

const toReversed = <T,>(arr: T[]): T[] => [...arr].reverse();

export const PERSIAN_MONTHS = [
  "فروردین",
  "اردیبهشت",
  "خرداد",
  "تیر",
  "مرداد",
  "شهریور",
  "مهر",
  "آبان",
  "آذر",
  "دی",
  "بهمن",
  "اسفند",
];

export const PERSIAN_WEEK_DAYS = [
  "شنبه",
  "یکشنبه",
  "دوشنبه",
  "سه‌شنبه",
  "چهارشنبه",
  "پنج‌شنبه",
  "جمعه",
];

const MIN_YEAR = 1400;
const MAX_YEAR = 1500;

function rangeInclusive(x: number, y: number): number[] {
  const length = y - x + 1;
  return Array.from({ length }, (_, i) => x + i);
}

export const getJDate = (year: number, month: number, day: number) =>
  moment(`${year}/${month}/${day}`, "jYYYY/jM/jD");

export const getDate = (year: number, month: number, day: number) =>
  getJDate(year, month, day).toDate();

export const jDaysInMonth = (year: number, month: number) =>
  moment.jDaysInMonth(year, month);

export const jWeekday = (year: number, month: number, day: number) => {
  const weekday = moment(`${year}/${month}/${day}`, "jYYYY/jM/jD").day();
  return (weekday + 1) % 7;
};

const Calendxr2 = ({
  renderDay,
  renderWeekDay,
  initialView,
  onViewChange,
}: {
  renderWeekDay: (day: number) => ReactNode;
  renderDay: (date: Date, isOut?: boolean) => ReactNode;
  initialView?: CalendxrView;
  onViewChange?: (view: CalendxrView) => void;
}) => {
  const today = useMemo(() => new Date(), []);
  const [view, setView] = useState<CalendxrView>(
    initialView || {
      month: moment(today).jMonth(), // 0-based
      year: moment(today).jYear(),
    }
  );

  const firstDayOfMonthWeekDay = useMemo(
    () => jWeekday(view.year, view.month + 1, 1),
    [view.month, view.year]
  );

  const lastDayOfMonthWeekDay = useMemo(
    () =>
      jWeekday(view.year, view.month + 1, jDaysInMonth(view.year, view.month)),
    [view.month, view.year]
  );

  const getContent = useScopedLocale(LOCALE_NS);

  const { prevMonth, prevYear, nextMonth, nextYear, prevMonthDays } =
    useMemo(() => {
      const prevMonth = view.month === 0 ? 11 : view.month - 1;
      const nextMonth = view.month === 11 ? 0 : view.month + 1;
      const prevYear = view.month === 0 ? view.year - 1 : view.year;
      const nextYear = view.month === 11 ? view.year + 1 : view.year;
      const prevMonthDays = jDaysInMonth(prevYear, prevMonth);
      return { prevMonth, prevYear, nextMonth, nextYear, prevMonthDays };
    }, [view.month, view.year]);

  const renderPrevMonthDays = useCallback(
    () =>
      toReversed(rangeInclusive(0, firstDayOfMonthWeekDay - 1)).map(
        (day, i) => (
          <span key={`prev${i}`} className={`${classes.day} ${classes.outDay}`}>
            {renderDay(
              getDate(prevYear, prevMonth + 1, prevMonthDays - day),
              true
            )}
          </span>
        )
      ),
    [firstDayOfMonthWeekDay, prevMonth, prevMonthDays, prevYear, renderDay]
  );

  const renderCurrentMonthDays = useCallback(
    () =>
      rangeInclusive(1, moment.jDaysInMonth(view.year, view.month)).map(
        (day) => (
          <span key={`day${day}`} className={classes.day}>
            {renderDay(getDate(view.year, view.month + 1, day))}
          </span>
        )
      ),
    [renderDay, view.month, view.year]
  );

  const renderNextMonthDays = useCallback(
    () =>
      rangeInclusive(lastDayOfMonthWeekDay + 1, 6).map((_, i) => (
        <span key={`next${i}`} className={`${classes.day} ${classes.outDay}`}>
          {renderDay(getDate(nextYear, nextMonth + 1, i + 1), true)}
        </span>
      )),
    [lastDayOfMonthWeekDay, nextMonth, nextYear, renderDay]
  );

  useEffect(() => {
    onViewChange?.(view);
  }, [onViewChange, view]);

  const years = useMemo(() => rangeInclusive(MIN_YEAR, MAX_YEAR), []);

  return (
    <div className={classes.main}>
      <div className={classes.header}>
        <button
          type="button"
          onClick={() =>
            setView((prev) => ({
              month: prev.month === 0 ? 11 : prev.month - 1,
              year: prev.month === 0 ? prev.year - 1 : prev.year,
            }))
          }
          className={classes.dir}
        >
          <Ixon width=".875rem" style={{ transform: "rotateZ(-90deg)" }}>
            <ChevronIcon />
          </Ixon>
          <span>{getContent("prevMonth")}</span>
        </button>
        <div className={classes.view}>
          <select
            value={view.month.toString()}
            onChange={(e) =>
              setView((prev) => ({ ...prev, month: Number(e.target.value) }))
            }
            className={classes.monthSelector}
          >
            {PERSIAN_MONTHS.map((month, i) => (
              <option key={month} value={i.toString()}>
                {getContent(`jalaliMonth${i + 1}` as ContentKey)}
              </option>
            ))}
          </select>
          <div className={classes.yearSelector}>
            <button
              onClick={() =>
                setView((prev) => ({ ...prev, year: prev.year - 1 }))
              }
              className={classes.yearBtn}
            >
              <Ixon width="1.5rem">
                <ChevronIcon />
              </Ixon>
            </button>
            <span>{view.year}</span>
            <button
              onClick={() =>
                setView((prev) => ({ ...prev, year: prev.year + 1 }))
              }
              className={classes.yearBtn}
            >
              <Ixon width="1.5rem" style={{ transform: "rotateZ(180deg)" }}>
                <ChevronIcon />
              </Ixon>
            </button>
          </div>
        </div>
        <button
          className={classes.dir}
          type="button"
          onClick={() =>
            setView((prev) => ({
              month: prev.month === 11 ? 0 : prev.month + 1,
              year: prev.month === 11 ? prev.year + 1 : prev.year,
            }))
          }
        >
          <span>{getContent("nextMonth")}</span>
          <Ixon width=".875rem" style={{ transform: "rotateZ(90deg)" }}>
            <ChevronIcon />
          </Ixon>
        </button>
      </div>
      <div className={classes.weekDays}>
        {PERSIAN_WEEK_DAYS.map((_, i) => (
          <div className={classes.weekDay} key={i}>
            {renderWeekDay(i)}
          </div>
        ))}
      </div>
      <div className={classes.days}>
        {renderPrevMonthDays()}
        {renderCurrentMonthDays()}
        {renderNextMonthDays()}
      </div>
    </div>
  );
};

export default Calendxr2;
