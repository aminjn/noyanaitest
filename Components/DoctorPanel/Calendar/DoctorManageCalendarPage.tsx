"use client";

import { Calendar } from "react-multi-date-picker";
import classes from "./DoctorManageCalendarPage.module.css";
import WithBalanceHeader from "../_UI/WithBalanceHeader";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import DoctorCalendarDay from "./DoctorCalendarDay";

const DoctorManageCalendarPage = () => {
  return (
    <WithBalanceHeader>
      <div className={`doctorCalendar ${classes.calendar}`}>
        <div className={classes.header}>
          <legend>تقویم</legend>
        </div>
        <Calendar
          className={classes.cal}
          calendar={persian}
          locale={persian_fa}
          highlightToday={false}
          minDate={new Date()}
          mapDays={({ date }) => {
            return {
              children: <DoctorCalendarDay stamp={date.toDate()} />,
            };
          }}
        />
      </div>
    </WithBalanceHeader>
  );
};

export default DoctorManageCalendarPage;
