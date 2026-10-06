import { tehranNoon, tehranParts, tehranTodayYmd, tehranYmd, type DateLike } from "@/Components/helpers/tehranTime";

// Booking days (2026-10, Tehran time): the doctor's days are Tehran calendar
// days, whatever the patient's device zone, and so is "today".

type AvailabilityLike = { date: DateLike; bounds?: { start: number; end: number }[] };

// today + n, as an instant (Tehran noon) safe to format the day with
export const shiftDateFromNow = (n: number) => tehranNoon(tehranTodayYmd(n));

// the availability record of a day (its stored date is that day's midnight)
export const availabilityOfDay = <T extends AvailabilityLike>(list: T[] | null | undefined, day: DateLike) => {
  const ymd = tehranYmd(day);
  return (Array.isArray(list) ? list : []).find((el) => !!el?.date && tehranYmd(el.date) === ymd);
};

// the bounds still bookable on that day: today only from the next hour on,
// in Tehran (the booking API refuses a slot whose hour has started)
export const bookableBounds = (availability: AvailabilityLike | undefined): [number, number][] => {
  const bounds = Array.isArray(availability?.bounds) ? availability.bounds : [];
  if (!availability) return [];
  const isToday = tehranYmd(availability.date) === tehranTodayYmd();
  const from = isToday ? (tehranParts().hour + 1) * 60 : 0;
  return bounds.filter(({ start }) => start >= from).map(({ start, end }) => [start, end]);
};
