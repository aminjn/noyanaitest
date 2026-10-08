"use client";

import { useState } from "react";
import classes from "./OpeningHoursEditor.module.css";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import ToggleInput from "../UI/ToggleInput";
import TimePicker from "../UI/TimePicker";
import DateInput from "../UI/DateInput";
import Button from "../UI/Button";
import { t2xsRegular, tsmDemiBold, tsmRegular, txsRegular } from "../UI/Typography";
import { tehranTodayYmd, tehranYmd } from "../helpers/tehranTime";
import useHoursFormat from "./useHoursFormat";
import {
  DAY_MINUTES,
  defaultWeek,
  exceptionsOf,
  HoursDay,
  HoursException,
  HoursRange,
  isOvernight,
  isRoundTheClockWeek,
  OpeningHours,
  roundTheClockWeek,
  WEEK_DAYS,
  weekOf,
} from "./openingHours";

const NS: ContentNamespace[] = ["openingHours"];

const MAX_RANGES = 4;

type Draft = { days: HoursDay[] | null; exceptions: HoursException[] };

const toValue = (d: Draft): OpeningHours | null =>
  !d.days && !d.exceptions.length ? null : { days: d.days || [], exceptions: d.exceptions };

// the next range of a day: after its last one, three hours long
const nextRange = (ranges: HoursRange[]): HoursRange => {
  const last = ranges[ranges.length - 1];
  const start = last ? Math.min(isOvernight(last) ? 8 * 60 : last.end + 60, 23 * 60) : 8 * 60;
  return { start, end: Math.min(start + 180, DAY_MINUTES) };
};

const RangesEditor = ({
  ranges,
  onChange,
  readOnly,
}: {
  ranges: HoursRange[];
  onChange: (ranges: HoursRange[]) => void;
  readOnly?: boolean;
}) => {
  const getContent = useScopedLocale(NS);
  const set = (i: number, patch: Partial<HoursRange>) =>
    onChange(ranges.map((r, j) => (j === i ? { ...r, ...patch } : r)));
  return (
    <div className={classes.ranges}>
      {ranges.map((r, i) => (
        <div key={i} className={classes.range}>
          <TimePicker
            prefix={getContent("ohFrom")}
            value={r.start}
            onChange={(v) => !readOnly && typeof v === "number" && set(i, { start: Math.min(v, DAY_MINUTES - 5) })}
          />
          <TimePicker
            prefix={getContent("ohTo")}
            value={r.end}
            onChange={(v) => !readOnly && typeof v === "number" && set(i, { end: v })}
          />
          {isOvernight(r) && <span className={`${classes.muted} ${t2xsRegular}`}>{getContent("ohNextDay")}</span>}
          {!readOnly && (
            <Button
              size="S"
              mode="Outline"
              variant="Error"
              radius="Medium"
              onClick={() => onChange(ranges.filter((_, j) => j !== i))}
            >
              {getContent("ohRemove")}
            </Button>
          )}
        </div>
      ))}
      {!readOnly && ranges.length < MAX_RANGES && (
        <span>
          <Button size="S" mode="Outline" radius="Medium" onClick={() => onChange([...ranges, nextRange(ranges)])}>
            {getContent("ohAddRange")}
          </Button>
        </span>
      )}
    </div>
  );
};

// The weekly opening hours of a pharmacy, lab, clinic or hospital (2026-10),
// one editor for every provider panel's profile (through CreateForm's
// "openingHours" field): round the clock, or per day closed / one or more
// ranges (one may run past midnight), "copy to all days", and holidays or
// special days. The backend keeps isRoundTheClock in step with it.
const OpeningHoursEditor = ({
  value,
  onChange,
  readOnly,
  title,
}: {
  value?: OpeningHours | null;
  onChange: (value: OpeningHours | null) => void;
  readOnly?: boolean;
  title?: string;
}) => {
  const getContent = useScopedLocale(NS);
  const fmt = useHoursFormat();
  const [draft, setDraft] = useState<Draft>(() => ({ days: weekOf(value), exceptions: exceptionsOf(value) }));
  // what the week was before "round the clock" was switched on
  const [beforeAllDay, setBeforeAllDay] = useState<HoursDay[] | null>(null);
  const [pickedDay, setPickedDay] = useState<string | null>(null);

  const update = (next: Draft) => {
    if (readOnly) return;
    setDraft(next);
    onChange(toValue(next));
  };
  const setDay = (day: number, ranges: HoursRange[]) =>
    draft.days && update({ ...draft, days: draft.days.map((d, i) => (i === day ? { ranges } : d)) });

  const allDay = isRoundTheClockWeek(draft.days);

  return (
    <div className={classes.main}>
      <div className={classes.head}>
        <span className={`${classes.title} ${tsmDemiBold}`}>{title || getContent("ohEditorTitle")}</span>
        <span className={`${classes.muted} ${txsRegular}`}>{getContent("ohEditorHint")}</span>
      </div>

      {!draft.days ? (
        <div className={classes.notSet}>
          <span className={`${classes.muted} ${txsRegular}`}>{getContent("ohNotSet")}</span>
          {!readOnly && (
            <span className={classes.actions}>
              <Button size="S" radius="Medium" onClick={() => update({ ...draft, days: defaultWeek() })}>
                {getContent("ohSetHours")}
              </Button>
              <Button size="S" mode="Outline" radius="Medium" onClick={() => update({ ...draft, days: roundTheClockWeek() })}>
                {getContent("ohAllDay")}
              </Button>
            </span>
          )}
        </div>
      ) : (
        <>
          <ToggleInput
            title={getContent("ohRoundTheClock")}
            value={allDay}
            readOnly={readOnly}
            onChange={() => {
              if (allDay) {
                update({ ...draft, days: beforeAllDay && !isRoundTheClockWeek(beforeAllDay) ? beforeAllDay : defaultWeek() });
              } else {
                setBeforeAllDay(draft.days);
                update({ ...draft, days: roundTheClockWeek() });
              }
            }}
          />
          {!allDay && (
            <div className={classes.week}>
              {WEEK_DAYS.map((day) => {
                const ranges = draft.days![day]?.ranges || [];
                const open = ranges.length > 0;
                return (
                  <div key={day} className={classes.dayRow}>
                    <div className={classes.dayHead}>
                      <span className={`${classes.dayName} ${tsmRegular}`}>{fmt.weekday(day)}</span>
                      <ToggleInput
                        title={open ? getContent("ohOpenDay") : getContent("ohClosedDay")}
                        value={open}
                        readOnly={readOnly}
                        onChange={() => setDay(day, open ? [] : [nextRange([])])}
                      />
                    </div>
                    <div className={classes.dayBody}>
                      {open && <RangesEditor ranges={ranges} readOnly={readOnly} onChange={(r) => setDay(day, r)} />}
                      {!readOnly && (
                        <span>
                          <button
                            type="button"
                            className={`${classes.linkButton} ${t2xsRegular}`}
                            onClick={() =>
                              update({
                                ...draft,
                                days: WEEK_DAYS.map(() => ({ ranges: ranges.map((r) => ({ ...r })) })),
                              })
                            }
                          >
                            {getContent("ohCopyToAll")}
                          </button>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      <div className={classes.section}>
        <span className={`${classes.title} ${tsmDemiBold}`}>{getContent("ohExceptions")}</span>
        <span className={`${classes.muted} ${txsRegular}`}>{getContent("ohExceptionsHint")}</span>
        {draft.exceptions.map((e) => {
          const closed = !e.ranges.length;
          const setEx = (ranges: HoursRange[]) =>
            update({ ...draft, exceptions: draft.exceptions.map((x) => (x.date === e.date ? { ...x, ranges } : x)) });
          return (
            <div key={e.date} className={classes.dayRow}>
              <div className={classes.dayHead}>
                <span className={`${classes.dayName} ${tsmRegular}`}>{fmt.day(e.date)}</span>
                <ToggleInput
                  title={getContent("ohExceptionClosed")}
                  value={closed}
                  readOnly={readOnly}
                  onChange={() => setEx(closed ? [nextRange([])] : [])}
                />
              </div>
              <div className={classes.dayBody}>
                {!closed && <RangesEditor ranges={e.ranges} readOnly={readOnly} onChange={setEx} />}
                {!readOnly && (
                  <span>
                    <Button
                      size="S"
                      mode="Outline"
                      variant="Error"
                      radius="Medium"
                      onClick={() => update({ ...draft, exceptions: draft.exceptions.filter((x) => x.date !== e.date) })}
                    >
                      {getContent("ohRemove")}
                    </Button>
                  </span>
                )}
              </div>
            </div>
          );
        })}
        {!readOnly && (
          <div className={classes.range}>
            <DateInput
              key={draft.exceptions.map((e) => e.date).join(",")}
              title={getContent("ohAddException")}
              onChange={(d) => setPickedDay(tehranYmd(d))}
            />
            <Button
              size="S"
              mode="Outline"
              radius="Medium"
              onClick={() => {
                if (!pickedDay || pickedDay < tehranTodayYmd()) return;
                if (!draft.exceptions.some((e) => e.date === pickedDay))
                  update({
                    ...draft,
                    exceptions: [...draft.exceptions, { date: pickedDay, ranges: [] }].sort((a, b) =>
                      a.date.localeCompare(b.date),
                    ),
                  });
                setPickedDay(null);
              }}
            >
              {getContent("ohAddException")}
            </Button>
          </div>
        )}
      </div>

      {!readOnly && !!draft.days && (
        <span>
          <Button size="S" mode="Outline" variant="Error" radius="Medium" onClick={() => update({ ...draft, days: null })}>
            {getContent("ohClear")}
          </Button>
        </span>
      )}
    </div>
  );
};

export default OpeningHoursEditor;
