import moment from "moment-jalaali";

export type GDate = { gy: number; gm: number; gd: number };
export type JDate = { jy: number; jm: number; jd: number };
export type SelectionMode = "single" | "multiple" | "range";

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

export const DEFAULT_PERSIAN_WEEKDAYS = ["ش", "ی", "د", "س", "چ", "پ", "ج"];

/** Convert a JS Date to Jalali */
export function toJalali(date: Date): JDate {
  const m = moment(date);
  return { jy: m.jYear(), jm: m.jMonth() + 1, jd: m.jDate() };
}

/** Convert Jalali date to JS Date (UTC midnight) */
export function fromJalali(jy: number, jm: number, jd: number): Date {
  const m = moment(`${jy}/${jm}/${jd}`, "jYYYY/jM/jD").startOf("day");
  return m.toDate();
}

/** Get the number of days in a given Jalali month */
export function jalaliMonthLength(jy: number, jm: number): number {
  return moment(`${jy}/${jm}/1`, "jYYYY/jM/jD").daysInMonth();
}

/** Get the weekday (0=Sun..6=Sat) of the first day of a Jalali month */
export function weekdayOfJalaliFirst(jy: number, jm: number): number {
  return moment(`${jy}/${jm}/1`, "jYYYY/jM/jD").day();
}

export function weekdayOfJalali(jy: number, jm: number, jd: number): number {
  return moment(`${jy}/${jm}/${jd}`, "jYYYY/jM/jD").day();
}

/** Check if two JS Dates are the same day */
export function isSameDay(a: Date, b: Date) {
  return moment(a).isSame(b, "day");
}

/** Check if a JS Date is within a range */
export function inRange(d: Date, start: Date | null, end: Date | null) {
  if (!start || !end) return false;
  const m = moment(d).startOf("day");
  return m.isBetween(
    moment(start).startOf("day").subtract(1, "ms"),
    moment(end).startOf("day").add(1, "ms")
  );
}

export function jalaliMonthWeekdays(
  jy: number,
  jm: number,
  weekdayIndex: number
): number[] {
  const daysInMonth = moment(`${jy}/${jm}/1`, "jYYYY/jM/jD").daysInMonth();
  const result: number[] = [];

  for (let jd = 1; jd <= daysInMonth + 1; jd++) {
    const m = moment(`${jy}/${jm}/${jd}`, "jYYYY/jM/jD");
    if (m.day() === weekdayIndex) result.push(jd);
  }

  return result;
}

// export type GDate = { gy: number; gm: number; gd: number };
// export type JDate = { jy: number; jm: number; jd: number };
// export type MarchInfo = { gy: number; march: number; leap: number };

// export const JALALI_BREAKS = [
//   -61, 9, 38, 199, 426, 686, 756, 818, 1111, 1181, 1210, 1635, 2060, 2097, 2192,
//   2262, 2324, 2394, 2456, 3178,
// ];

// export function div(a: number, b: number) {
//   return Math.trunc(a / b);
// }

export function mod(a: number, b: number) {
  return a - b * Math.floor(a / b);
}

// export function g2d(gy: number, gm: number, gd: number): number {
//   const a = div(14 - gm, 12);
//   const y = gy + 4800 - a;
//   const m = gm + 12 * a - 3;
//   return (
//     gd +
//     div(153 * m + 2, 5) +
//     365 * y +
//     div(y, 4) -
//     div(y, 100) +
//     div(y, 400) -
//     32045
//   );
// }

// export function d2g(jdn: number): GDate {
//   const a = jdn + 32044;
//   const b = div(4 * a + 3, 146097);
//   const c = a - div(146097 * b, 4);
//   const d = div(4 * c + 3, 1461);
//   const e = c - div(1461 * d, 4);
//   const m = div(5 * e + 2, 153);
//   const gd = e - div(153 * m + 2, 5) + 1;
//   const gm = m + 3 - 12 * div(m, 10);
//   const gy = 100 * b + d - 4800 + div(m, 10);
//   return { gy, gm, gd };
// }

// export function jalCal(jy: number): MarchInfo {
//   const gy = jy + 621;
//   let leapJ = -14;
//   let jp = JALALI_BREAKS[0];
//   let jm = 0;

//   for (let i = 1; i < JALALI_BREAKS.length; i++) {
//     jm = JALALI_BREAKS[i];
//     const jump = jm - jp;
//     if (jy < jm) {
//       leapJ += div(jy - jp, 33) * 8 + div(mod(jy - jp, 33) + 3, 4);
//       const n = mod(jump, 33);
//       if (n === 4 && jump - (jy - jp) === 4) leapJ += 1;
//       break;
//     }
//     leapJ += div(jump, 33) * 8 + div(mod(jump, 33), 4);
//     jp = jm;
//   }

//   const leapG = div(gy, 4) - div(div(gy, 100) + 1, 25) - 150;
//   const march = 20 + leapJ - leapG;
//   const n = jy - jp;
//   const leap = mod(mod(n + 1, 33) - 1, 4);
//   return { gy, march, leap };
// }

// export function j2d(jy: number, jm: number, jd: number): number {
//   const r = jalCal(jy);
//   const { gy, march, leap } = r;
//   const jdn1f = g2d(gy, 3, march); // JDN of 1 Farvardin

//   // Days before this month
//   let daysBeforeMonth = 0;
//   if (jm <= 6) daysBeforeMonth = (jm - 1) * 31;
//   else if (jm <= 11) daysBeforeMonth = 6 * 31 + (jm - 7) * 30;
//   else daysBeforeMonth = 6 * 31 + 5 * 30; // month 12

//   // Add day-of-month offset
//   const k = daysBeforeMonth + (jd - 1);

//   // If it's month 12 and leap year, make sure jd <= 30
//   if (jm === 12 && leap === 1 && jd > 30) jd = 30;

//   return jdn1f + k;
// }

// export function d2j(jdn: number): JDate {
//   const g = d2g(jdn);
//   let jy = g.gy - 621;
//   const r = jalCal(jy);
//   const jdn1f = g2d(r.gy, 3, r.march);
//   let k = jdn - jdn1f;
//   let jm: number, jd: number;

//   if (k >= 0) {
//     if (k <= 185) {
//       jm = 1 + div(k, 31);
//       jd = 1 + mod(k, 31);
//     } else {
//       k -= 186;
//       jm = 7 + div(k, 30);
//       jd = 1 + mod(k, 30);
//     }
//   } else {
//     jy -= 1;
//     const rPrev = jalCal(jy);
//     let t = k + 179;
//     if (rPrev.leap === 0) t += 1;
//     if (t <= 185) {
//       jm = 7 + div(t, 30);
//       jd = 1 + mod(t, 30);
//     } else {
//       t -= 186;
//       jm = 1 + div(t, 31);
//       jd = 1 + mod(t, 31);
//     }
//   }

//   return { jy, jm, jd };
// }

// export function toJalali(date: Date): JDate {
//   const jdn = g2d(date.getFullYear(), date.getMonth() + 1, date.getDate());
//   return d2j(jdn);
// }

// export function fromJalali(jy: number, jm: number, jd: number): Date {
//   const jdn = j2d(jy, jm, jd);
//   const { gy, gm, gd } = d2g(jdn);
//   // Use Date.UTC to avoid local timezone shifts
//   return new Date(Date.UTC(gy, gm - 1, gd));
// }

// export function jalaliMonthLength(jy: number, jm: number): number {
//   if (jm <= 6) return 31;
//   if (jm <= 11) return 30;
//   const { leap } = jalCal(jy);
//   return leap === 0 ? 30 : 29;
// }

// export function weekdayOfJalaliFirst(jy: number, jm: number): number {
//   const d = fromJalali(jy, jm, 1);
//   return d.getDay();
// }

// export const PERSIAN_MONTHS = [
//   "فروردین",
//   "اردیبهشت",
//   "خرداد",
//   "تیر",
//   "مرداد",
//   "شهریور",
//   "مهر",
//   "آبان",
//   "آذر",
//   "دی",
//   "بهمن",
//   "اسفند",
// ];

// export const DEFAULT_PERSIAN_WEEKDAYS = ["ش", "ی", "د", "س", "چ", "پ", "ج"];

export const allClassNames = [
  "container",
  "header",
  "navButton",
  "monthTitle",
  "weekdays",
  "daysGrid",
  "dayButton",
  "selectedDay",
  "inRangeDay",
  "todayButton",
] as const;

export type CalendxrClassName = (typeof allClassNames)[number];

// export type SelectionMode = "single" | "multiple" | "range";

// export function isSameDay(a: Date, b: Date) {
//   return (
//     a.getFullYear() === b.getFullYear() &&
//     a.getMonth() === b.getMonth() &&
//     a.getDate() === b.getDate()
//   );
// }

// export function inRange(d: Date, start: Date | null, end: Date | null) {
//   if (!start || !end) return false;
//   const da = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
//   const sa = new Date(
//     start.getFullYear(),
//     start.getMonth(),
//     start.getDate()
//   ).getTime();
//   const ea = new Date(
//     end.getFullYear(),
//     end.getMonth(),
//     end.getDate()
//   ).getTime();
//   return da >= sa && da <= ea;
// }
