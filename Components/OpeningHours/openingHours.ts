// Structured weekly opening hours (2026-10), the shape the backend stores
// and computes "open now" from (noyanaitest-back Lib/openingHours.ts):
// days 0 = Saturday ... 6 = Friday, ranges in minutes since Tehran midnight
// (end 1440 = 24:00; end < start runs past midnight), exceptions for one
// Tehran "YYYY-MM-DD" day (no range = closed). The status ("open now,
// closes at 22:00") is computed by the backend at request time and comes on
// each centre as `openStatus`.

export const DAY_MINUTES = 1440;
// shift-day order: Saturday first (the Iranian week)
export const WEEK_DAYS = [0, 1, 2, 3, 4, 5, 6] as const;

export type HoursRange = { start: number; end: number };
export type HoursDay = { ranges: HoursRange[] };
export type HoursException = { date: string; ranges: HoursRange[] };
export type OpeningHours = { days: HoursDay[]; exceptions?: HoursException[] };

export type OpenMoment = { dayOffset: number; minutes: number; day: number };
export type OpenStatus = {
  open: boolean;
  allDay?: boolean;
  closesAt?: OpenMoment;
  opensAt?: OpenMoment;
  exceptionToday?: boolean;
};

// the fields a centre (pharmacy, lab, clinic, hospital) carries
export type WithOpeningHours = {
  openingHours?: OpeningHours | null;
  openStatus?: OpenStatus | null;
  isRoundTheClock?: boolean;
};

const isRange = (r: unknown): r is HoursRange =>
  !!r &&
  typeof r === "object" &&
  Number.isFinite((r as HoursRange).start) &&
  Number.isFinite((r as HoursRange).end);

export const rangesOf = (d: unknown): HoursRange[] =>
  d && typeof d === "object" && Array.isArray((d as HoursDay).ranges)
    ? (d as HoursDay).ranges.filter(isRange)
    : [];

// the week a centre gave, or null when it gave none (or bad data)
export const weekOf = (h: unknown): HoursDay[] | null => {
  if (!h || typeof h !== "object") return null;
  const days = (h as OpeningHours).days;
  if (!Array.isArray(days) || days.length !== 7) return null;
  return days.map((d) => ({ ranges: rangesOf(d) }));
};

export const exceptionsOf = (h: unknown): HoursException[] =>
  h && typeof h === "object" && Array.isArray((h as OpeningHours).exceptions)
    ? (h as OpeningHours).exceptions!.filter(
        (e): e is HoursException => !!e && typeof e.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(e.date),
      ).map((e) => ({ date: e.date, ranges: rangesOf(e) }))
    : [];

export const isFullDay = (d?: HoursDay) => !!d && d.ranges.some((r) => r.start === 0 && r.end === DAY_MINUTES);

export const isRoundTheClockWeek = (days: HoursDay[] | null) => !!days && days.length === 7 && days.every(isFullDay);

export const roundTheClockWeek = (): HoursDay[] =>
  WEEK_DAYS.map(() => ({ ranges: [{ start: 0, end: DAY_MINUTES }] }));

// what "set hours" starts from: every day 08:00-20:00
export const defaultWeek = (): HoursDay[] => WEEK_DAYS.map(() => ({ ranges: [{ start: 8 * 60, end: 20 * 60 }] }));

export const isOvernight = (r: HoursRange) => r.end < r.start;

// "شبانه روزی", "شبانه‌روزی", "24 ساعته", "۲۴ ساعته", "24/7"... - the words
// that only say "open round the clock" (backend isRoundTheClockText): that
// is the hours' round-the-clock switch, never a centre tag (2026-10)
const ROUND_THE_CLOCK_TEXT =
  /^(شبانه[\s-]*روزی?|24)?\s*(شبانه[\s-]*روزی?|24\s*ساعته|24\s*\/\s*7|24\s*h(ours)?|24\s*ساعت(ه)?|round\s*the\s*clock)$/i;
export const isRoundTheClockText = (text: unknown) => {
  if (typeof text !== "string") return false;
  const s = text
    .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)))
    .replace(/ي/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/[\u200c\u200d]/g, " ")
    .replace(/^[\s«»"'()[\].،,:#-]+|[\s«»"'()[\].،,:#-]+$/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return !!s && ROUND_THE_CLOCK_TEXT.test(s);
};
