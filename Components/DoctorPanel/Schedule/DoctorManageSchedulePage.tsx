"use client";

import useSWR from "swr";
import classes from "./DoctorManageSchedulePage.module.css";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import TableBox from "@/Components/UI/TableBox";
import useLocale from "@/Components/Hooks/useLocale";
import useBreadCrump from "@/Components/Hooks/useBreadCrump";
import { IBooking } from "../Calendar/DoctorCalendarDay";
import { useMemo } from "react";
import ScheduleBookingCard from "./ScheduleBookingCard";
import ScheduleReservationCard from "./ScheduleReservationCard";
import { IReservation } from "@/Components/Dashboard/Booking/DashboardManageBookingsPage";
import { getSessionDateKey } from "@/Components/helpers/lib";

export type IScheduleBooking = IBooking<{
  Session: { Clinic: Record<string, never> };
  User: true;
  Patient: Record<string, never>;
}>;

export type IScheduleReservation = IReservation<{
  User: Record<never, never>;
  Patient: Record<never, never>;
  Office: Record<never, never>;
}>;

// Merged per F-01: getMySchedule now returns Bookings (System A) and
// Reservations (System B) side by side, since a doctor previously had no
// way to see Reservations from this page at all. See
// AUDIT/FIXES_TODO.md F-01.
type ScheduleEntry =
  | { kind: "booking"; date: string; start: number; node: IScheduleBooking }
  | {
      kind: "reservation";
      date: string;
      start: number;
      node: IScheduleReservation;
    };

const DoctorManageSchedulePage = () => {
  const { data, error } = useSWR<{
    bookings: IScheduleBooking[];
    reservations: IScheduleReservation[];
  }>(`${API}/doctor/schedule`, (url: string) =>
    fetcher({ url }).then((res) => res.data),
  );

  const getContent = useLocale();

  useBreadCrump([
    { title: getContent("dashboard"), target: "/doctorpanel" },
    { title: getContent("schedule"), target: "/doctorpanel/schedule" },
  ]);

  const days = useMemo<
    { key: string; label: string; entries: ScheduleEntry[] }[]
  >(() => {
    if (!data) return [];
    const map = new Map<string, ScheduleEntry[]>();
    for (const booking of data.bookings) {
      const key = booking.session.date;
      if (!map.has(key)) map.set(key, []);
      map.get(key)?.push({
        kind: "booking",
        date: key,
        start: booking.session.start,
        node: booking,
      });
    }
    for (const reservation of data.reservations) {
      const key = getSessionDateKey(new Date(reservation.date));
      if (!map.has(key)) map.set(key, []);
      map.get(key)?.push({
        kind: "reservation",
        date: key,
        start: reservation.start,
        node: reservation,
      });
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
      .map(([key, entries]) => ({
        key,
        entries: entries.sort((a, b) => a.start - b.start),
        label: new Date(key).toLocaleDateString("fa-IR", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
      }));
  }, [data]);

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <div className={classes.main}>
          {!days.length && (
            <div className={classes.empty}>{getContent("nothingFound")}</div>
          )}
          {days.map((day) => (
            <TableBox key={day.key} title={day.label}>
              <div className={classes.cards}>
                {day.entries.map((entry) =>
                  entry.kind === "booking" ? (
                    <ScheduleBookingCard
                      key={`booking-${entry.node._id}`}
                      node={entry.node}
                    />
                  ) : (
                    <ScheduleReservationCard
                      key={`reservation-${entry.node._id}`}
                      node={entry.node}
                    />
                  ),
                )}
              </div>
            </TableBox>
          ))}
        </div>
      )}
    </HandleLoading>
  );
};

export default DoctorManageSchedulePage;
