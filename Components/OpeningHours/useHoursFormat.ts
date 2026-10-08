import { useCallback, useMemo } from "react";
import { useIntlLocale } from "../i18n/navigation";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import { tehranDateFormat, tehranNoon } from "../helpers/tehranTime";
import { OpenMoment, OpenStatus } from "./openingHours";

const NS: ContentNamespace[] = ["openingHours"];

// Opening hours in the reader's language, on Tehran's clock: weekday names
// (0 = Saturday), "08:00" / "24:00" in the locale's digits, a day of an
// exception, and the "open now / closes at / opens tomorrow" line.
const useHoursFormat = () => {
  const intl = useIntlLocale();
  const getContent = useScopedLocale(NS);
  const two = useMemo(() => new Intl.NumberFormat(intl, { minimumIntegerDigits: 2, useGrouping: false }), [intl]);
  const weekdayFmt = useMemo(() => tehranDateFormat(intl, { weekday: "long" }), [intl]);
  const dayFmt = useMemo(() => tehranDateFormat(intl, { weekday: "short", day: "numeric", month: "short" }), [intl]);

  // minutes since midnight as HH:MM (24:00 stays 24:00)
  const time = useCallback(
    (m: number) => {
      const v = Math.max(0, Math.min(1440, Math.round(Number(m) || 0)));
      return `${two.format(Math.floor(v / 60))}:${two.format(v % 60)}`;
    },
    [two],
  );
  // 2026-10-10 was a Saturday
  const weekday = useCallback(
    (day: number) => {
      try {
        return weekdayFmt.format(tehranNoon(`2026-10-${String(10 + (((day % 7) + 7) % 7)).padStart(2, "0")}`));
      } catch {
        return "";
      }
    },
    [weekdayFmt],
  );
  const day = useCallback(
    (ymd: string) => {
      try {
        return dayFmt.format(tehranNoon(ymd));
      } catch {
        return ymd;
      }
    },
    [dayFmt],
  );

  const dayWord = useCallback(
    (m: OpenMoment) => (m.dayOffset === 1 ? getContent("ohTomorrow") : weekday(m.day)),
    [getContent, weekday],
  );

  // the badge: [headline, detail]
  const status = useCallback(
    (s?: OpenStatus | null): { open: boolean; title: string; detail: string } | null => {
      if (!s || typeof s !== "object") return null;
      if (s.open) {
        if (s.allDay || !s.closesAt) return { open: true, title: getContent("ohOpen24h"), detail: "" };
        const c = s.closesAt;
        return {
          open: true,
          title: getContent("ohOpenNow"),
          detail:
            c.dayOffset <= 0
              ? getContent("ohClosesAt", [time(c.minutes)])
              : getContent("ohClosesOn", [dayWord(c), time(c.minutes)]),
        };
      }
      const o = s.opensAt;
      return {
        open: false,
        title: getContent("ohClosedNow"),
        detail: !o
          ? ""
          : o.dayOffset <= 0
            ? getContent("ohOpensAt", [time(o.minutes)])
            : o.dayOffset === 1
              ? getContent("ohOpensTomorrow", [time(o.minutes)])
              : getContent("ohOpensOn", [weekday(o.day), time(o.minutes)]),
      };
    },
    [dayWord, getContent, time, weekday],
  );

  return { time, weekday, day, status };
};

export default useHoursFormat;
