"use client";
import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { useIntlLocale } from "@/Components/i18n/navigation";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import { DoctorSessionType } from "@/Components/DoctorPanel/Calendar/DoctorCalendarDay";
import { addDaysYmd, diffDaysYmd, TEHRAN_TZ, tehranNoon, tehranTodayYmd } from "@/Components/helpers/tehranTime";
import { availabilityOfDay, bookableBounds } from "../availabilityDay";
import TehranTimeHint from "../TehranTimeHint";
import Ixon from "@/Components/UI/Ixon";
import ClockIcon from "@/Components/Icons/ClockIcon";
import ArrowLeftIcon from "@/Components/Icons/ArrowLeftIcon";
import SunIcon from "@/Components/Icons/SunIcon";
import MoonIcon from "@/Components/Icons/MoonIcon";
import LoadingIcon from "@/Components/Icons/LoadingIcon";
import useProgressBusy from "@/Components/Hooks/useProgressBusy";
import { clock, DayPeriod, dayPeriods, periodKey, periodOf, useBookableSlots } from "./bookingFlow";
import WaitlistJoin from "./WaitlistJoin";
import classes from "./SlotPicker.module.css";

const NS: ContentNamespace[] = ["common", "bookingFlow"];

// times shown per part of the day before "more"
const PER_PERIOD = 8;

const periodIcon: Record<DayPeriod, JSX.Element> = { morning: <SunIcon />, afternoon: <SunIcon />, evening: <MoonIcon /> };

export type SlotPick = { ymd: string; start: number; end: number; office: string };

// The slot picker of the whole booking flow (doctor profile sidebar and
// sheet, the search popup, the finalize page, reschedule): a strip of days
// with their free count, the day's times grouped morning / afternoon /
// evening, and the next free time always one tap away (Doctolib, Zocdoc,
// Paziresh24). Empty and loading states never leave the patient stuck.
const SlotPicker = ({
  doctorId,
  sessionType,
  office,
  value,
  onChange,
  fallback,
  days: maxDays,
  initialDay,
  waitlist,
}: {
  doctorId: string;
  sessionType: DoctorSessionType | null | undefined;
  office?: string | null;
  value: SlotPick | null;
  onChange: (pick: SlotPick | null) => void;
  // shown when nothing is free in the whole horizon (other doctors, etc.)
  fallback?: ReactNode;
  days?: number;
  // the day to open on ("YYYY-MM-DD"), e.g. the one tapped on a card
  initialDay?: string;
  // offer «خبرم کن» (the waitlist) when the doctor is full or no time suits
  // (booking only, not when moving a visit)
  waitlist?: boolean;
}) => {
  const getContent = useScopedLocale(NS);
  const intlTag = useIntlLocale();
  const nf = useMemo(() => new Intl.NumberFormat(intlTag), [intlTag]);
  const fmt = useMemo(
    () => ({
      weekday: new Intl.DateTimeFormat(intlTag, { timeZone: TEHRAN_TZ, weekday: "short" }),
      weekdayLong: new Intl.DateTimeFormat(intlTag, { timeZone: TEHRAN_TZ, weekday: "long" }),
      day: new Intl.DateTimeFormat(intlTag, { timeZone: TEHRAN_TZ, day: "numeric" }),
      month: new Intl.DateTimeFormat(intlTag, { timeZone: TEHRAN_TZ, month: "short" }),
      full: new Intl.DateTimeFormat(intlTag, { timeZone: TEHRAN_TZ, weekday: "long", day: "numeric", month: "long" }),
    }),
    [intlTag],
  );
  const { data, error, isLoading, mutate } = useBookableSlots(doctorId, sessionType, office);
  // a tapped time that opens the next page: it shows it is working, and
  // further taps wait (no double navigation)
  const navigating = useProgressBusy();

  const today = tehranTodayYmd();
  const horizon = Math.min(maxDays || data?.horizon || 30, 60);
  const strip = useMemo(() => Array.from({ length: horizon }, (_, i) => addDaysYmd(today, i)), [horizon, today]);

  // the free times of each day (today only from the next hour on)
  const freeOf = useMemo(() => {
    const map = new Map<string, { start: number; end: number; office: string }[]>();
    for (const ymd of strip) {
      const record = availabilityOfDay(data?.days, tehranNoon(ymd));
      const allowed = new Set(bookableBounds(record).map(([s, e]) => `${s}-${e}`));
      map.set(
        ymd,
        (record?.bounds || []).filter((b) => allowed.has(`${b.start}-${b.end}`)) as {
          start: number;
          end: number;
          office: string;
        }[],
      );
    }
    return map;
  }, [data?.days, strip]);

  // the official holidays of the horizon (closed: no visits that day)
  const holidayOf = useMemo(
    () => new Map((data?.holidays || []).map((h) => [h.ymd, h])),
    [data?.holidays],
  );

  const firstFree = useMemo(() => strip.find((ymd) => (freeOf.get(ymd) || []).length), [freeOf, strip]);
  const [day, setDay] = useState<string | null>(value?.ymd || initialDay || null);
  // the day opens on the picked slot, else the first free day
  useEffect(() => {
    if (value?.ymd) setDay(value.ymd);
    else if (!day && firstFree) setDay(firstFree);
  }, [day, firstFree, value?.ymd]);
  // a pick that is no longer free (taken meanwhile, another type) is dropped
  useEffect(() => {
    if (!value || !data) return;
    const still = (freeOf.get(value.ymd) || []).some((b) => b.start === value.start && b.end === value.end);
    if (!still) onChange(null);
  }, [data, freeOf, onChange, value]);

  // a long day shows its first times per part, the rest on request
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  useEffect(() => setExpanded({}), [day]);
  const stripRef = useRef<HTMLDivElement>(null);
  // the arrows beside the strip (pointer screens): a page of days forward
  // or back, whatever the writing direction
  const scrollStrip = (forward: boolean) => {
    const el = stripRef.current;
    if (!el) return;
    const rtl = getComputedStyle(el).direction === "rtl";
    el.scrollBy({ left: (forward ? 1 : -1) * (rtl ? -1 : 1) * el.clientWidth * 0.8, behavior: "smooth" });
  };
  useEffect(() => {
    const el = stripRef.current?.querySelector<HTMLElement>("[data-on='true']");
    el?.scrollIntoView({ block: "nearest", inline: "center" });
  }, [day]);
  // a day tapped with its times below the fold (a phone sheet with several
  // visit types above it): the strip moves up so the times show - the tap
  // otherwise seemed to do nothing
  const wrapRef = useRef<HTMLDivElement>(null);
  const dayTapped = useRef(false);
  useEffect(() => {
    if (!dayTapped.current) return;
    dayTapped.current = false;
    const frame = requestAnimationFrame(() => {
      const first = wrapRef.current?.parentElement?.querySelector<HTMLElement>(`.${classes.period}, .${classes.state}`);
      const view = window.visualViewport?.height || window.innerHeight;
      // the sheet's / page's bottom bar covers about the last 8rem
      if (first && first.getBoundingClientRect().top > view - 160)
        wrapRef.current?.scrollIntoView({ block: "start", behavior: "smooth" });
    });
    return () => cancelAnimationFrame(frame);
  }, [day]);

  const dayLabel = (ymd: string) => {
    const diff = diffDaysYmd(today, ymd);
    if (diff === 0) return getContent("today");
    if (diff === 1) return getContent("tomorrow");
    return fmt.weekday.format(tehranNoon(ymd));
  };
  const longDay = (ymd: string) => {
    const diff = diffDaysYmd(today, ymd);
    const date = fmt.full.format(tehranNoon(ymd));
    return diff === 0
      ? getContent("bfDayAndDate", [getContent("today"), date])
      : diff === 1
        ? getContent("bfDayAndDate", [getContent("tomorrow"), date])
        : date;
  };

  if (!sessionType) return null;

  if (error && !data)
    return (
      <div className={classes.state} role="alert">
        <p>{getContent("bfSlotsError")}</p>
        <button type="button" className={classes.linkBtn} onClick={() => mutate()}>
          {getContent("bfRetry")}
        </button>
      </div>
    );

  if (isLoading || !data)
    return (
      <div className={classes.picker} aria-busy="true">
        <div className={classes.strip}>
          {Array.from({ length: 6 }, (_, i) => (
            <span key={i} className={`${classes.day} ${classes.skeleton}`} />
          ))}
        </div>
        <div className={classes.grid}>
          {Array.from({ length: 8 }, (_, i) => (
            <span key={i} className={`${classes.slot} ${classes.skeleton}`} />
          ))}
        </div>
      </div>
    );

  if (!firstFree)
    return (
      <div className={classes.full}>
        <strong>{getContent("bfFullyBooked")}</strong>
        <p>{getContent("bfFullyBookedText", [nf.format(horizon)])}</p>
        {waitlist && <WaitlistJoin doctorId={doctorId} sessionType={sessionType} office={office} horizon={horizon} />}
        {fallback}
      </div>
    );

  const free = (day && freeOf.get(day)) || [];
  const groups = dayPeriods
    .map((p) => ({ period: p as DayPeriod, slots: free.filter((b) => periodOf(b.start) === p) }))
    .filter((g) => g.slots.length);
  const nextAfter = day ? strip.find((ymd) => ymd > day && (freeOf.get(ymd) || []).length) : undefined;
  const first = freeOf.get(firstFree)?.[0];
  const isFirstPicked = !!value && !!first && value.ymd === firstFree && value.start === first.start;

  return (
    <div className={classes.picker}>
      {!!first && (
        <button
          type="button"
          className={`${classes.first} ${isFirstPicked ? classes.firstOn : ""}`}
          aria-busy={isFirstPicked && navigating}
          onClick={() => {
            if (navigating) return;
            setDay(firstFree);
            onChange({ ymd: firstFree, ...first });
          }}
        >
          <span className={`${classes.firstIcon} tone-amber`}>
            <Ixon width="1rem">
              <ClockIcon />
            </Ixon>
          </span>
          <span className={classes.firstText}>
            <small>{getContent("bfFirstAvailable")}</small>
            <b>{`${longDay(firstFree)} · ${clock(first.start, nf)}`}</b>
          </span>
          {isFirstPicked && navigating && (
            <Ixon width="1.25rem" className={classes.spin}>
              <LoadingIcon />
            </Ixon>
          )}
        </button>
      )}

      <div className={classes.stripWrap} ref={wrapRef}>
        <button
          type="button"
          className={`${classes.arrow} ${classes.arrowPrev}`}
          aria-label={getContent("bfPickDay")}
          tabIndex={-1}
          onClick={() => scrollStrip(false)}
        >
          <Ixon width="1rem" className={classes.back}>
            <ArrowLeftIcon />
          </Ixon>
        </button>
        <div className={classes.strip} ref={stripRef} role="listbox" aria-label={getContent("bfPickDay")}>
          {strip.map((ymd) => {
            const count = (freeOf.get(ymd) || []).length;
            const on = ymd === day;
            const holiday = holidayOf.get(ymd);
            const closedHoliday = !!holiday?.closed;
            return (
              <button
                key={ymd}
                type="button"
                role="option"
                aria-selected={on}
                data-on={on}
                disabled={!count}
                className={`${classes.day} ${on ? classes.dayOn : ""} ${closedHoliday ? classes.dayHoliday : ""}`}
                title={holiday ? getContent("holDayLabel", [holiday.title]) : undefined}
                aria-label={`${longDay(ymd)}: ${
                  closedHoliday
                    ? getContent("holDayLabel", [holiday?.title || ""])
                    : count
                      ? getContent("bfFreeCount", [nf.format(count)])
                      : getContent("bfNoSlotsDay")
                }`}
                onClick={() => {
                  dayTapped.current = true;
                  setDay(ymd);
                }}
              >
                <span className={classes.dayName}>{dayLabel(ymd)}</span>
                <span className={classes.dayNum}>{fmt.day.format(tehranNoon(ymd))}</span>
                {closedHoliday ? (
                  <span className={classes.dayHolidayTag}>{getContent("bfHolidayShort")}</span>
                ) : (
                  <span className={classes.dayMonth}>{fmt.month.format(tehranNoon(ymd))}</span>
                )}
                <span className={classes.dayDot} aria-hidden />
              </button>
            );
          })}
        </div>
        <button
          type="button"
          className={`${classes.arrow} ${classes.arrowNext}`}
          aria-label={getContent("bfPickDay")}
          tabIndex={-1}
          onClick={() => scrollStrip(true)}
        >
          <Ixon width="1rem">
            <ArrowLeftIcon />
          </Ixon>
        </button>
      </div>

      {!!day && (
        <div className={classes.dayHead}>
          <strong>{longDay(day)}</strong>
          {!!holidayOf.get(day) && (
            <span className={`${classes.holidayLine} ${holidayOf.get(day)?.closed ? "" : classes.holidayLineOpen}`}>
              {getContent("holDayLabel", [holidayOf.get(day)?.title || ""])}
            </span>
          )}
          {!!free.length && <span className={classes.freeCount}>{getContent("bfFreeCount", [nf.format(free.length)])}</span>}
          <TehranTimeHint ns={NS} className={classes.hintRow} />
          {/* today's passed times are not offered: say so, the doctor's
              full day otherwise looks shorter than the panel shows */}
          {day === today && <small className={classes.hintRow}>{getContent("bfTodayPastHidden")}</small>}
        </div>
      )}

      {groups.length ? (
        groups.map((g) => (
          <section key={g.period} className={classes.period}>
            <h4 className={classes.periodTitle}>
              <Ixon width="0.9rem" className={classes.periodIcon}>
                {periodIcon[g.period]}
              </Ixon>
              {getContent(periodKey[g.period])}
              <span>{nf.format(g.slots.length)}</span>
            </h4>
            <div className={classes.grid}>
              {(expanded[g.period] || g.slots.length <= PER_PERIOD ? g.slots : g.slots.slice(0, PER_PERIOD - 1)).map((b) => {
                const on = !!value && value.ymd === day && value.start === b.start && value.end === b.end;
                return (
                  <button
                    key={`${b.start}-${b.end}`}
                    type="button"
                    aria-pressed={on}
                    aria-busy={on && navigating}
                    className={`${classes.slot} ${on ? classes.slotOn : ""}`}
                    onClick={() => !navigating && day && onChange(on ? null : { ymd: day, ...b })}
                  >
                    {on && navigating ? (
                      <span className={classes.slotBusy}>
                        <Ixon width="1rem">
                          <LoadingIcon />
                        </Ixon>
                        {clock(b.start, nf)}
                      </span>
                    ) : (
                      clock(b.start, nf)
                    )}
                  </button>
                );
              })}
              {!expanded[g.period] && g.slots.length > PER_PERIOD && (
                <button
                  type="button"
                  className={`${classes.slot} ${classes.more}`}
                  onClick={() => setExpanded((prev) => ({ ...prev, [g.period]: true }))}
                >
                  {getContent("bfMoreTimes", [nf.format(g.slots.length - PER_PERIOD + 1)])}
                </button>
              )}
            </div>
          </section>
        ))
      ) : (
        <div className={classes.state}>
          <p>{day && holidayOf.get(day)?.closed ? getContent("bfHolidayClosedText") : getContent("bfNoSlotsDay")}</p>
          {!!nextAfter && (
            <button type="button" className={classes.nextBtn} onClick={() => setDay(nextAfter)}>
              <span>{getContent("bfNextFree", [longDay(nextAfter)])}</span>
              <Ixon width="1rem">
                <ArrowLeftIcon />
              </Ixon>
            </button>
          )}
        </div>
      )}

      {waitlist && (
        <WaitlistJoin doctorId={doctorId} sessionType={sessionType} office={office} horizon={horizon} variant="link" />
      )}
    </div>
  );
};

export default SlotPicker;
