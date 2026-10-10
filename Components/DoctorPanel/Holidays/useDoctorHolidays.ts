"use client";
import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";

// The doctor's official holidays (backend Controllers/doctorHolidayController.ts,
// 2026-10): the holidays of the booking horizon, the doctor's choice for
// each and the visits already booked on it. One SWR key, shared by the hours
// page section and the agenda's day marks.
// `estimated`: a lunar date not yet fixed by the calendar authority («تاریخ تقریبی»)
export type DoctorHoliday = { ymd: string; title: string; closed: boolean; booked: number; estimated?: boolean };
export type DoctorHolidays = {
  works: boolean;
  horizonEnd: string;
  holidays: DoctorHoliday[];
  next: { ymd: string; title: string } | null;
};

const YMD = /^\d{4}-\d{2}-\d{2}$/;

// bad data never crashes the page
const clean = (raw: unknown): DoctorHolidays => {
  const d = (raw || {}) as Partial<DoctorHolidays>;
  return {
    works: d.works === true,
    horizonEnd: typeof d.horizonEnd === "string" ? d.horizonEnd : "",
    holidays: (Array.isArray(d.holidays) ? d.holidays : [])
      .filter((h) => !!h && typeof h.ymd === "string" && YMD.test(h.ymd))
      .map((h) => ({ ymd: h.ymd, title: String(h.title || ""), closed: h.closed !== false, booked: Number(h.booked) || 0, estimated: h.estimated === true })),
    next: d.next && typeof d.next.ymd === "string" && YMD.test(d.next.ymd) ? { ymd: d.next.ymd, title: String(d.next.title || "") } : null,
  };
};

export const DOCTOR_HOLIDAYS_KEY = `${API}/doctor/holidays`;

const useDoctorHolidays = (enabled = true) =>
  useSWR<DoctorHolidays>(enabled ? DOCTOR_HOLIDAYS_KEY : null, (url: string) =>
    fetcher({ url }).then((res) => clean(res?.data)),
  );

export default useDoctorHolidays;
