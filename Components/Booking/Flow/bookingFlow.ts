"use client";
import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import { DoctorSessionType, doctorSessionTypes } from "@/Components/DoctorPanel/Calendar/DoctorCalendarDay";
import { ContentKey } from "@/Components/Enums/contentKeys";
import { tehranYmd } from "@/Components/helpers/tehranTime";

// The patient booking flow (2026-10 redesign, docs/booking-benchmark.md):
// choose (visit type, office, day, time) -> details (who, why, insurance,
// code, payment) -> confirm. The slots come from GET /public/dr/:id/slots,
// which applies the same rules as POST /booking/reserve, per visit type and
// office; its days keep the DoctorAvailability shape so
// Components/Booking/availabilityDay.ts reads them as is.

export type BookableSlot = { start: number; end: number; office: string };
export type BookableDay = { date: string; ymd: string; bounds: BookableSlot[] };
export type BookableSlots = {
  days: BookableDay[];
  horizon: number;
  nextAvailable: (BookableSlot & { date: string; ymd: string }) | null;
};

export const useBookableSlots = (
  doctorId: string | undefined,
  sessionType: DoctorSessionType | null | undefined,
  office?: string | null,
) => {
  const params = new URLSearchParams();
  if (sessionType) params.set("sessionType", sessionType);
  if (office) params.set("office", office);
  return useSWR<BookableSlots>(
    doctorId && sessionType ? `${API}/public/dr/${doctorId}/slots?${params.toString()}` : null,
    (url: string) =>
      fetcher({ url }).then((res) => {
        const d = res?.data || {};
        // bad data never crashes the picker
        return {
          days: (Array.isArray(d.days) ? d.days : []).filter(
            (x: BookableDay) => !!x?.ymd && Array.isArray(x.bounds),
          ),
          horizon: Number(d.horizon) || 30,
          nextAvailable: d.nextAvailable?.ymd ? d.nextAvailable : null,
        } as BookableSlots;
      }),
    { revalidateOnFocus: true, keepPreviousData: true },
  );
};

// The checkout quote (POST /booking/quote): what the booking will charge,
// line by line, for this user.
export type BookingQuote = {
  price: number;
  hidePrice: boolean;
  clubDiscount: number;
  tax: number;
  taxPercent: number;
  proDiscount: number;
  proPotential: number;
  pro: boolean;
  total: number;
  deskTotal: number;
  payAtDesk: boolean;
  code: { applied: boolean; name?: string } | null;
  // the insurances this doctor (or the office's centre) accepts for this
  // visit: basic or supplementary, their plans with a tariff of their own,
  // and whether a tariff covers this visit at all
  insurances: InsuranceOption[];
  // (2026-10) the insurers' estimated shares of the insurances picked
  // (basic first); total and deskTotal are already the patient's part
  insurance?: {
    lines: InsurerLine[];
    insurerShare: number;
    patientShare: number;
    notAccepted: { _id: string; name: string }[];
    saved: InsurancePick[];
    estimate: true;
    error?: string;
  };
  balance: number;
};

export type InsurancePick = { insurance: string; plan?: string | null };
export type InsuranceOption = {
  _id: string;
  name: string;
  image?: string;
  isBasic?: boolean;
  via?: "doctor" | "centre";
  plans?: { _id: string; name: string }[];
  covered?: boolean;
};
export type InsurerLine = {
  insurance: string;
  name: string;
  role: "basic" | "supplementary";
  plan?: string | null;
  planName?: string;
  base: number;
  share: number;
  // no share: "noTariff" | "limit"
  reason?: string;
};

// a slot's part of the day, Doctolib / Zocdoc style
export const dayPeriods = ["morning", "afternoon", "evening"] as const;
export type DayPeriod = (typeof dayPeriods)[number];
export const periodOf = (start: number): DayPeriod =>
  start < 12 * 60 ? "morning" : start < 17 * 60 ? "afternoon" : "evening";
export const periodKey: Record<DayPeriod, ContentKey> = {
  morning: "bfMorning",
  afternoon: "bfAfternoon",
  evening: "bfEvening",
};

// the order visit types are offered in
// (in person first; online in the market's habit order: text, call, video)
export const visitTypeOrder: DoctorSessionType[] = ["inPerson", "textChat", "voiceCall", "sipCall", "videoCall"].filter(
  (t): t is DoctorSessionType => (doctorSessionTypes as readonly string[]).includes(t),
);

export const isOnline = (t?: DoctorSessionType | null) => !!t && t !== "inPerson";

// what to expect, per visit type (the confirmation's "prepare" list)
export const prepKeys: Record<DoctorSessionType, ContentKey[]> = {
  inPerson: ["bfPrepArrive", "bfPrepDocs", "bfPrepMeds"],
  videoCall: ["bfPrepVideo", "bfPrepQuiet", "bfPrepMeds"],
  voiceCall: ["bfPrepCall", "bfPrepQuiet", "bfPrepMeds"],
  sipCall: ["bfPrepPhone", "bfPrepQuiet", "bfPrepMeds"],
  textChat: ["bfPrepChat", "bfPrepPhotos", "bfPrepMeds"],
};

// /book/finalize/<doctor>?d=YYYY-MM-DD&s=&e=&t=&o=  (the finalize page
// posts the Tehran day as "YYYY-MM-DD")
export const finalizeHref = (
  doctorId: string,
  pick?: { ymd: string; start: number; end: number; sessionType?: DoctorSessionType | null; office?: string | null },
) => {
  if (!pick) return `/book/finalize/${doctorId}`;
  const q = new URLSearchParams({ d: pick.ymd, s: String(pick.start), e: String(pick.end) });
  if (pick.sessionType) q.set("t", pick.sessionType);
  if (pick.office) q.set("o", pick.office);
  return `/book/finalize/${doctorId}?${q.toString()}`;
};

export const ymdOf = (d: string | Date) => tehranYmd(d);

// two-digit clock in the reader's digits
export const clock = (minutes: number, nf: Intl.NumberFormat) => {
  const two = (n: number) => nf.format(n).padStart(2, nf.format(0));
  return `${two(Math.floor(minutes / 60))}:${two(minutes % 60)}`;
};
