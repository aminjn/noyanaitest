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

export type IScheduleBooking = IBooking<{
  Session: { Clinic: Record<string, never> };
  User: true;
  Patient: Record<string, never>;
}>;

const DoctorManageSchedulePage = () => {
  const { data, error } = useSWR<IScheduleBooking[]>(
    `${API}/doctor/schedule`,
    (url: string) => fetcher({ url }).then((res) => res.data),
  );

  const getContent = useLocale();

  useBreadCrump([
    { title: getContent("dashboard"), target: "/doctorpanel" },
    { title: getContent("schedule"), target: "/doctorpanel/schedule" },
  ]);

  const days = useMemo<
    { key: string; label: string; bookings: IScheduleBooking[] }[]
  >(() => {
    if (!data) return [];
    const map = new Map<string, IScheduleBooking[]>();
    for (const booking of data) {
      const key = booking.session.date;
      if (!map.has(key)) map.set(key, []);
      map.get(key)?.push(booking);
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
      .map(([key, bookings]) => ({
        key,
        bookings,
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
                {day.bookings.map((booking) => (
                  <ScheduleBookingCard key={booking._id} node={booking} />
                ))}
              </div>
            </TableBox>
          ))}
        </div>
      )}
    </HandleLoading>
  );
};

export default DoctorManageSchedulePage;
