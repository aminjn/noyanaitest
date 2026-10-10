"use client";
import useSWR, { useSWRConfig } from "swr";
import { useCallback } from "react";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import { DOCTOR_HOLIDAYS_KEY } from "../Holidays/useDoctorHolidays";

// The hours page's month calendar (2026-10): one request per shown month
// (backend GET /doctor/hours/summary, Controllers/doctorHoursController.ts),
// every day at a glance. SWR keeps each month, so going back and forth
// never asks again; a change made on the page (a holiday, a day off, the
// weekly hours) refreshes every month already read.

export type HoursVisit = {
  _id: string;
  start: number;
  end: number;
  sessionType: string;
  status: string;
  patient: string;
  office: string | null;
};

export type HoursTimeOff = { _id: string; from: string; to: string; note?: string; startMin?: number; endMin?: number };

export type HoursDay = {
  ymd: string;
  // 0 = Saturday ... 6 = Friday
  weekday: number;
  working: boolean;
  slots: number;
  booked: number;
  // null: outside today..the booking horizon
  free: number | null;
  holiday?: { title: string; closed: boolean; estimated?: boolean };
  timeOff?: HoursTimeOff[];
  visits?: HoursVisit[];
};

export type HoursSummary = {
  from: string;
  to: string;
  today: string;
  horizonEnd: string | null;
  works: boolean;
  // the caller may read the agenda (the day's visits are in `days`)
  visits: boolean;
  days: HoursDay[];
};

const YMD = /^\d{4}-\d{2}-\d{2}$/;
const n = (v: unknown) => (Number.isFinite(Number(v)) ? Number(v) : 0);
const ymdOr = (v: unknown, fallback: string) => (typeof v === "string" && YMD.test(v) ? v : fallback);

// bad data never crashes the calendar
export const cleanSummary = (raw: unknown): HoursSummary => {
  const d = (raw || {}) as Partial<HoursSummary>;
  const days = (Array.isArray(d.days) ? d.days : [])
    .filter((x): x is HoursDay => !!x && typeof x.ymd === "string" && YMD.test(x.ymd))
    .map((x) => ({
      ymd: x.ymd,
      weekday: n(x.weekday) % 7,
      working: x.working === true,
      slots: n(x.slots),
      booked: n(x.booked),
      free: x.free === null || x.free === undefined ? null : n(x.free),
      holiday:
        x.holiday && typeof x.holiday === "object"
          ? { title: String(x.holiday.title || ""), closed: x.holiday.closed !== false, estimated: x.holiday.estimated === true }
          : undefined,
      timeOff: (Array.isArray(x.timeOff) ? x.timeOff : [])
        .filter((t) => !!t && typeof t._id === "string")
        .map((t) => ({
          _id: t._id,
          from: ymdOr(t.from, x.ymd),
          to: ymdOr(t.to, x.ymd),
          note: typeof t.note === "string" ? t.note : undefined,
          ...(typeof t.startMin === "number" && typeof t.endMin === "number" ? { startMin: t.startMin, endMin: t.endMin } : {}),
        })),
      visits: (Array.isArray(x.visits) ? x.visits : [])
        .filter((v) => !!v && typeof v._id === "string")
        .map((v) => ({
          _id: v._id,
          start: n(v.start),
          end: n(v.end),
          sessionType: String(v.sessionType || ""),
          status: String(v.status || ""),
          patient: String(v.patient || ""),
          office: typeof v.office === "string" ? v.office : null,
        })),
    }));
  return {
    from: ymdOr(d.from, days[0]?.ymd || ""),
    to: ymdOr(d.to, days[days.length - 1]?.ymd || ""),
    today: ymdOr(d.today, ""),
    horizonEnd: typeof d.horizonEnd === "string" && YMD.test(d.horizonEnd) ? d.horizonEnd : null,
    works: d.works === true,
    visits: d.visits === true,
    days,
  };
};

const PREFIX = `${API}/doctor/hours/summary`;
export const hoursSummaryKey = (from: string, to: string) => `${PREFIX}?from=${from}&to=${to}`;

const useHoursSummary = (range: { from: string; to: string } | null) =>
  useSWR<HoursSummary>(
    range ? hoursSummaryKey(range.from, range.to) : null,
    (url: string) => fetcher({ url }).then((res) => cleanSummary(res?.data)),
    // the month stays on screen while the next one loads
    { keepPreviousData: true, revalidateOnFocus: false, dedupingInterval: 30_000 },
  );

// refresh every month read so far (and the holidays list the agenda uses)
export const useRefreshHours = () => {
  const { mutate } = useSWRConfig();
  return useCallback(
    () =>
      Promise.all([
        mutate((key) => typeof key === "string" && key.startsWith(PREFIX)),
        mutate(DOCTOR_HOLIDAYS_KEY),
        mutate(`${API}/doctor/timeoff`),
        mutate(`${API}/doctor/booking-status`),
      ]),
    [mutate],
  );
};

export default useHoursSummary;
