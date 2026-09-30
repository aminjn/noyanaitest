"use client";

import Calendxr2, {
  CalendxrView,
  getDate,
  getJDate,
  jDaysInMonth,
  jWeekday,
  useJalaliWeekDayNames,
} from "@/Components/UI/Calendar/Calendxr2";
import FormatDate from "@/Components/UI/FormatDate";
import classes from "./DoctorManageCalendarPage.module.css";
import AddSessionsAgent from "./AddSessionsAgent";
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";
import moment from "moment-jalaali";
import Ixon from "@/Components/UI/Ixon";
import CheckIcon from "@/Components/Icons/CheckIcon";
import MinusIcon from "@/Components/Icons/MinusIcon";
import DoctorCalendarDay from "./DoctorCalendarDay";
import Loading from "@/Components/Admin/UI/Loading";
import useBreadCrump from "@/Components/Hooks/useBreadCrump";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const NS: ContentNamespace[] = ["common", "doctorPanelCalendar"];

type WeekDayStatus = "Full" | "None" | "Partial";

const WeekDay = ({
  index,
  selected,
  setSelected,
  view,
}: {
  index: number;
  view: CalendxrView;
  selected: Date[];
  setSelected: Dispatch<SetStateAction<Date[]>>;
}) => {
  const weekDayNames = useJalaliWeekDayNames();
  const status = useMemo<WeekDayStatus>(() => {
    const weekDay = jWeekday(view.year, view.month + 1, 1);
    let currentDayMatchingThisWeekDay = 1 + ((index + 7 - weekDay) % 7);
    const theseWeekDayDays: Date[] = [];
    while (
      currentDayMatchingThisWeekDay <= jDaysInMonth(view.year, view.month)
    ) {
      const theDay = getDate(
        view.year,
        view.month + 1,
        currentDayMatchingThisWeekDay
      );
      if (theDay > new Date()) theseWeekDayDays.push(theDay);
      currentDayMatchingThisWeekDay += 7;
    }
    const applicableSelectedDays = theseWeekDayDays.filter(
      (day) => !!selected.find((d) => d.toDateString() === day.toDateString())
    );
    if (!applicableSelectedDays.length) return "None";
    return applicableSelectedDays.length !== theseWeekDayDays.length
      ? "Partial"
      : "Full";
  }, [index, selected, view.month, view.year]);

  return (
    <button
      onClick={() => {
        setSelected((prev) => {
          const clone = [...prev];
          const weekDay = jWeekday(view.year, view.month + 1, 1);
          let currentDayMatchingThisWeekDay = 1 + ((index + 7 - weekDay) % 7);
          const theseWeekDayDays: Date[] = [];
          while (
            currentDayMatchingThisWeekDay <= jDaysInMonth(view.year, view.month)
          ) {
            const theDay = getDate(
              view.year,
              view.month + 1,
              currentDayMatchingThisWeekDay
            );
            if (theDay > new Date()) theseWeekDayDays.push(theDay);
            currentDayMatchingThisWeekDay += 7;
          }
          const someSelected = theseWeekDayDays.some(
            (day) =>
              !!selected.find((d) => d.toDateString() === day.toDateString())
          );
          if (someSelected) {
            for (let i = clone.length - 1; i >= 0; i--) {
              if (
                theseWeekDayDays.some(
                  (day) => day.toDateString() === clone[i].toDateString()
                )
              ) {
                clone.splice(i, 1);
              }
            }
          } else {
            clone.push(...theseWeekDayDays);
          }
          clone.sort((a, b) => a.getTime() - b.getTime());
          return clone;
        });
      }}
      className={`${classes.weekDay}`}
    >
      <span className={classes.check}>
        {status === "None" ? (
          <span className={classes.empty} />
        ) : (
          <Ixon>{status === "Full" ? <CheckIcon /> : <MinusIcon />}</Ixon>
        )}
      </span>
      <span>{weekDayNames[index]}</span>
    </button>
  );
};

const DoctorManageCalendarPage = () => {
  const getContent = useScopedLocale(NS);

  useBreadCrump([
    { title: getContent("dashboard"), target: "/doctorpanel" },
    { title: getContent("bookingCalendar"), target: "/doctorpanel/calendar" },
  ]);

  const today = useMemo<Date>(() => {
    const then = new Date();
    then.setMinutes(0);
    then.setHours(0);
    then.setSeconds(0);
    then.setMilliseconds(0);
    return then;
  }, []);
  const [selected, setSelected] = useState<Date[]>([]);
  const [view, setView] = useState<CalendxrView>({
    month: moment(today).jMonth(),
    year: moment(today).jYear(),
  });

  const [shouldShow, setShouldShow] = useState<boolean>(true);

  useEffect(() => {
    if (!shouldShow) setShouldShow(true);
  }, [shouldShow]);

  return (
    <div className={classes.main}>
      <div className={classes.calendar}>
        {shouldShow ? (
          <Calendxr2
            renderDay={(date, isOut) => (
              <DoctorCalendarDay
                isOut={!!isOut}
                stamp={date}
                selected={
                  !!selected.find(
                    (d) => date.toDateString() === d.toDateString()
                  )
                }
                onSelect={() =>
                  setSelected((prev) => {
                    const clone = [...prev];
                    const index = clone.findIndex(
                      (d) => d.toDateString() === date.toDateString()
                    );
                    if (index === -1) {
                      clone.push(date);
                    } else {
                      clone.splice(index, 1);
                    }
                    clone.sort((a, b) => a.getTime() - b.getTime());
                    return clone;
                  })
                }
              />
            )}
            renderWeekDay={(day) => (
              <WeekDay
                index={day}
                selected={selected}
                setSelected={setSelected}
                view={view}
              />
            )}
            onViewChange={setView}
          />
        ) : (
          <Loading />
        )}
      </div>
      <AddSessionsAgent
        selected={selected}
        setSelected={setSelected}
        mutate={() => setShouldShow(false)}
      />
    </div>
  );
};

export default DoctorManageCalendarPage;
