// Tehran time (2026-10, owner's decision: the site runs on Tehran time).
//
// Clinics are in Iran: a visit at 10:00 in Tehran shows 10:00 for every
// viewer, whatever the device's time zone. Days ("today", a day's visits, a
// slot's day) are Tehran calendar days, written "YYYY-MM-DD". The backend
// mirror is Lib/tehranTime.ts in noyanaitest-back.
//
// A reservation / availability `date` from the API is a day key (the
// midnight of the visit's day, at Tehran or UTC midnight depending on when
// it was saved); read it with tehranYmd(date), never with getDate().

export const TEHRAN_TZ = "Asia/Tehran";

export type DateLike = Date | number | string;

export type TehranParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  // 0 = Sunday ... 6 = Saturday
  weekday: number;
  ymd: string;
  minutes: number;
};

let partsFormat: Intl.DateTimeFormat | null = null;
const getPartsFormat = () =>
  (partsFormat ||= new Intl.DateTimeFormat("en-US", {
    timeZone: TEHRAN_TZ,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    weekday: "short",
  }));

const WEEKDAYS: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
const pad = (n: number, w = 2) => String(n).padStart(w, "0");
const ymdOf = (y: number, m: number, d: number) => `${pad(y, 4)}-${pad(m)}-${pad(d)}`;
const toDate = (d: DateLike) => (d instanceof Date ? d : new Date(d));
const YMD = /^(\d{4})-(\d{1,2})-(\d{1,2})$/;

export const isYmd = (v: unknown): v is string => typeof v === "string" && YMD.test(v.trim());

// the wall clock in Tehran at an instant (an invalid date gives NaN parts)
export const tehranParts = (at: DateLike = new Date()): TehranParts => {
  const date = toDate(at);
  if (isNaN(date.getTime()))
    return { year: NaN, month: NaN, day: NaN, hour: NaN, minute: NaN, second: NaN, weekday: NaN, ymd: "", minutes: NaN };
  const p: Record<string, string> = {};
  for (const part of getPartsFormat().formatToParts(date)) p[part.type] = part.value;
  const year = Number(p.year);
  const month = Number(p.month);
  const day = Number(p.day);
  const hour = Number(p.hour) % 24;
  const minute = Number(p.minute);
  return {
    year,
    month,
    day,
    hour,
    minute,
    second: Number(p.second),
    weekday: WEEKDAYS[p.weekday] ?? 0,
    ymd: ymdOf(year, month, day),
    minutes: hour * 60 + minute,
  };
};

// "YYYY-MM-DD" of the Tehran day ("" for an invalid date); a "YYYY-MM-DD"
// string is that day already
export const tehranYmd = (at: DateLike = new Date()) =>
  isYmd(at) ? ymdOf(...(splitYmd(at) as [number, number, number])) : tehranParts(at).ymd;

// minutes since Tehran midnight
export const tehranMinutesOfDay = (at: DateLike = new Date()) => tehranParts(at).minutes;

// 0 = Sunday ... 6 = Saturday, in Tehran
export const tehranWeekday = (at: DateLike = new Date()) => tehranParts(at).weekday;

// the shift day index (0 = Saturday ... 6 = Friday) in Tehran
export const tehranSaturdayDay = (at: DateLike = new Date()) => (tehranWeekday(at) + 1) % 7;

const splitYmd = (ymd: string) => {
  const m = YMD.exec(ymd.trim());
  return m ? [Number(m[1]), Number(m[2]), Number(m[3])] : [NaN, NaN, NaN];
};

const offsetMinutes = (at: number) => {
  const p = tehranParts(at);
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  return Math.round((asUtc - Math.floor(at / 1000) * 1000) / 60000);
};

// the instant of a Tehran wall-clock time: a "YYYY-MM-DD" day plus minutes
export const fromTehranWallClock = (ymd: string, minutes = 0): Date => {
  const [y, m, d] = splitYmd(ymd);
  if (isNaN(y)) return new Date(NaN);
  const wall = Date.UTC(y, m - 1, d) + Math.round(minutes * 60000);
  let guess = wall - offsetMinutes(wall) * 60000;
  guess = wall - offsetMinutes(guess) * 60000;
  return new Date(guess);
};

// noon of a Tehran day: a safe instant to format a day with (any zone)
export const tehranNoon = (ymd: string) => fromTehranWallClock(ymd, 12 * 60);

// Tehran's midnight of the day an instant falls in
export const startOfTehranDay = (at: DateLike = new Date()) => fromTehranWallClock(tehranYmd(at), 0);

// "YYYY-MM-DD" n calendar days later (negative: earlier)
export const addDaysYmd = (ymd: string, n: number) => {
  const [y, m, d] = splitYmd(ymd);
  const t = new Date(Date.UTC(y, m - 1, d + n));
  return ymdOf(t.getUTCFullYear(), t.getUTCMonth() + 1, t.getUTCDate());
};

// today in Tehran, n days on
export const tehranTodayYmd = (n = 0) => addDaysYmd(tehranYmd(), n);

// whole days from one "YYYY-MM-DD" to another
export const diffDaysYmd = (from: string, to: string) => {
  const [y1, m1, d1] = splitYmd(from);
  const [y2, m2, d2] = splitYmd(to);
  return Math.round((Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / 864e5);
};

// the instant a visit starts / ends: its day key plus Tehran minutes
export const tehranInstantOf = (dayKey: DateLike, minutes: number) => fromTehranWallClock(tehranYmd(dayKey), minutes);

// two instants on the same Tehran day
export const sameTehranDay = (a: DateLike, b: DateLike) => tehranYmd(a) === tehranYmd(b);

// "YYYY-MM-DDTHH:mm" in Tehran, the value of an <input type="datetime-local">
export const tehranLocalInput = (at: DateLike = new Date()) => {
  const p = tehranParts(at);
  return p.ymd ? `${p.ymd}T${pad(p.hour)}:${pad(p.minute)}` : "";
};

// the instant of an <input type="datetime-local"> value read as Tehran time
export const fromTehranLocalInput = (value: string) => {
  const m = /^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2})/.exec(value || "");
  return m ? fromTehranWallClock(m[1], Number(m[2]) * 60 + Number(m[3])) : new Date(NaN);
};

// A Tehran "YYYY-MM-DD" day as a date picker's own value. The pickers work
// in the device's calendar (the day clicked is the device-local day), so a
// day goes in as its local noon and comes out with local getters.
export const pickerDate = (ymd: string) => {
  const [y, m, d] = splitYmd(ymd);
  return new Date(y, (m || 1) - 1, d || 1, 12);
};

// today in Tehran (n days on) as a date picker's value
export const tehranTodayPicker = (n = 0) => pickerDate(tehranTodayYmd(n));

// Intl options with Tehran's zone, unless the caller named one
export const withTehranZone = <T extends Intl.DateTimeFormatOptions | undefined>(options?: T) =>
  ({ ...(options || {}), timeZone: options?.timeZone || TEHRAN_TZ }) as Intl.DateTimeFormatOptions;

// an Intl.DateTimeFormat in Tehran time
export const tehranDateFormat = (locale: string | string[] | undefined, options?: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat(locale, withTehranZone(options));

// Defence in depth (like TZ=Asia/Tehran on the server): every date the
// browser formats without naming a zone (Intl.DateTimeFormat,
// toLocaleString / toLocaleDateString / toLocaleTimeString, also inside
// libraries) is shown in Tehran time, not the device's. Plain JavaScript in a
// string so the root layout runs it in <head>, before any bundle formats a
// date; installTehranTimeZone runs the same on the server (SSR).
export const tehranTimeZoneInitScript = `(function(){try{
var g=globalThis;if(g.__noyanTehranTz)return;g.__noyanTehranTz=true;var TZ="${TEHRAN_TZ}";
function z(o){if(o&&typeof o==="object"&&o.timeZone)return o;return Object.assign({},o||{},{timeZone:TZ});}
var O=Intl.DateTimeFormat;var P=function(l,o){return new O(l,z(o));};
Object.defineProperty(P,"prototype",{value:O.prototype});P.supportedLocalesOf=O.supportedLocalesOf.bind(O);Intl.DateTimeFormat=P;
var d=Date.prototype,a=d.toLocaleString,b=d.toLocaleDateString,c=d.toLocaleTimeString;
d.toLocaleString=function(l,o){return a.call(this,l,z(o));};
d.toLocaleDateString=function(l,o){return b.call(this,l,z(o));};
d.toLocaleTimeString=function(l,o){return c.call(this,l,z(o));};
}catch(e){}})();`;

export const installTehranTimeZone = () => {
  // the same script, run here (server render, tests)
  new Function(tehranTimeZoneInitScript)();
};
