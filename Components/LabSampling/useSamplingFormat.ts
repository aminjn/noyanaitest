import { useCallback, useMemo } from "react";
import { useIntlLocale } from "../i18n/navigation";
import { fromTehranWallClock, tehranDateFormat, tehranNoon } from "../helpers/tehranTime";

// Days and times of sampling appointments in the reader's language, always
// on Tehran's clock (the lab's): "Fri 9 Oct", "07:00–07:30".
const useSamplingFormat = () => {
  const intl = useIntlLocale();
  const dayFmt = useMemo(
    () => tehranDateFormat(intl, { weekday: "short", day: "numeric", month: "short" }),
    [intl],
  );
  const longDayFmt = useMemo(
    () => tehranDateFormat(intl, { weekday: "long", day: "numeric", month: "long", year: "numeric" }),
    [intl],
  );
  const weekdayFmt = useMemo(() => tehranDateFormat(intl, { weekday: "long" }), [intl]);
  const timeFmt = useMemo(
    () => tehranDateFormat(intl, { hour: "2-digit", minute: "2-digit", hourCycle: "h23" }),
    [intl],
  );
  const safe = (fn: () => string) => {
    try {
      return fn();
    } catch {
      return "";
    }
  };
  const day = useCallback((ymd: string) => safe(() => dayFmt.format(tehranNoon(ymd))), [dayFmt]);
  const longDay = useCallback((ymd: string) => safe(() => longDayFmt.format(tehranNoon(ymd))), [longDayFmt]);
  const time = useCallback(
    (ymd: string, minutes: number) => safe(() => timeFmt.format(fromTehranWallClock(ymd, minutes))),
    [timeFmt],
  );
  const range = useCallback(
    (ymd: string, start: number, end: number) => `${time(ymd, start)}–${time(ymd, end)}`,
    [time],
  );
  // the name of a shift day (0 = Saturday ... 6 = Friday); 2026-10-10 was
  // a Saturday
  const weekday = useCallback(
    (shiftDay: number) =>
      safe(() => weekdayFmt.format(tehranNoon(`2026-10-${String(10 + shiftDay).padStart(2, "0")}`))),
    [weekdayFmt],
  );
  return { day, longDay, time, range, weekday };
};

export default useSamplingFormat;
