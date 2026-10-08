import classes from "./OpeningHoursTable.module.css";
import { tsmDemiBold, tsmRegular, txsRegular } from "../UI/Typography";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import useHoursFormat from "./useHoursFormat";
import OpenStatusBadge from "./OpenStatusBadge";
import {
  exceptionsOf,
  HoursRange,
  isFullDay,
  isOvernight,
  OpeningHours,
  OpenStatus,
  WEEK_DAYS,
  weekOf,
} from "./openingHours";
import { addDaysYmd, tehranParts, tehranTodayYmd } from "../helpers/tehranTime";
import { useListSeparator } from "../i18n/navigation";

const NS: ContentNamespace[] = ["openingHours"];

// how far ahead a holiday / special day is listed
const UPCOMING_DAYS = 30;

// A centre's week on its public page (2026-10): the open-now badge, every
// day Saturday to Friday with its ranges (today marked), the coming
// holidays and special days, and the centre's own note (the free text it
// had before the structured week). Google / Doctolib show the same table.
const OpeningHoursTable = ({
  hours,
  status,
  note,
  className = "",
}: {
  hours?: OpeningHours | null;
  status?: OpenStatus | null;
  note?: string | null;
  className?: string;
}) => {
  const getContent = useScopedLocale(NS);
  const fmt = useHoursFormat();
  const listSep = useListSeparator();
  const week = weekOf(hours);
  const today = tehranTodayYmd();
  const last = addDaysYmd(today, UPCOMING_DAYS);
  const upcoming = exceptionsOf(hours).filter((e) => e.date >= today && e.date <= last);
  const text = typeof note === "string" ? note.trim() : "";
  if (!week && !upcoming.length && !text) return null;
  const todayDay = (tehranParts().weekday + 1) % 7;

  const rangesText = (ranges: HoursRange[]) =>
    !ranges.length
      ? getContent("ohClosedDay")
      : ranges.some((r) => r.start === 0 && r.end === 1440)
        ? getContent("ohAllDay")
        : ranges
            .map(
              (r) =>
                `${fmt.time(r.start)}–${fmt.time(r.end)}${isOvernight(r) ? ` (${getContent("ohNextDay")})` : ""}`,
            )
            .join(listSep);

  return (
    <section className={`${classes.main} ${className}`}>
      <div className={classes.header}>
        <h3 className={`${classes.title} ${tsmDemiBold}`}>{getContent("ohWeekTitle")}</h3>
        <OpenStatusBadge status={status} />
      </div>
      {!!week && (
        <dl className={classes.week}>
          {WEEK_DAYS.map((d) => (
            <div
              key={d}
              className={`${classes.row} ${d === todayDay ? classes.today : ""} ${
                !week[d].ranges.length ? classes.closedRow : ""
              }`}
            >
              <dt className={tsmRegular}>
                {fmt.weekday(d)}
                {d === todayDay && <span className={`${classes.todayTag} ${txsRegular}`}>{getContent("ohToday")}</span>}
              </dt>
              <dd className={`${tsmRegular} ${isFullDay(week[d]) ? classes.allDay : ""}`}>{rangesText(week[d].ranges)}</dd>
            </div>
          ))}
        </dl>
      )}
      {!!upcoming.length && (
        <div className={classes.special}>
          <span className={`${classes.subTitle} ${txsRegular}`}>{getContent("ohSpecialDays")}</span>
          <dl className={classes.week}>
            {upcoming.map((e) => (
              <div key={e.date} className={`${classes.row} ${!e.ranges.length ? classes.closedRow : ""}`}>
                <dt className={tsmRegular}>{fmt.day(e.date)}</dt>
                <dd className={tsmRegular}>{rangesText(e.ranges)}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}
      {!!text && (
        <p className={`${classes.note} ${txsRegular}`}>
          {week || upcoming.length ? `${getContent("ohHoursNote")}: ${text}` : text}
        </p>
      )}
    </section>
  );
};

export default OpeningHoursTable;
