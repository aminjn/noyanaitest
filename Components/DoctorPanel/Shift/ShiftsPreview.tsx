import useLocale from "@/Components/Hooks/useLocale";
import {
  daysOfWeekContentKeys,
  DoctorShiftDay,
  ShiftContext,
} from "./DoctorManageShiftsPage";
import classes from "./ShiftsPreview.module.css";
import useShiftUtils from "./useShiftUtils";
import { Fragment, useMemo } from "react";
import useComplexLocale from "@/Components/Hooks/useComplexLocale";
import { IOffice } from "../Office/DoctorManageOfficesPage";
import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import { numberToTime } from "../Calendar/AddSessionsAgent";

const ShiftsPreview = ({
  data,
  day,
  off,
}: {
  data: ShiftContext;
  day: DoctorShiftDay;
  off?: boolean;
}) => {
  const { getShiftSessions } = useShiftUtils();

  const { data: offices } = useSWR<IOffice[]>(
    `${API}/doctor/office`,
    (url: string) => fetcher({ url }).then((res) => res.data),
  );

  const getContent = useLocale();

  const getCompContent = useComplexLocale();

  const todaysShifts = useMemo<ShiftContext>(
    () => data.filter((el) => el.day === day),
    [data, day],
  );

  return (
    <div className={classes.main}>
      <div className={classes.header}>
        <span className={classes.title}>
          {getContent("previewXDayOfWeekShifts", [
            getContent(daysOfWeekContentKeys[day]),
          ])}
        </span>
        <span className={classes.value}>
          {getCompContent("xSessions", [
            todaysShifts
              .reduce((acc, el) => acc + getShiftSessions(el).length, 0)
              .toString(),
          ])}
        </span>
      </div>
      {!!off ? (
        <div className={classes.off}>{getContent("thisDayIsOff")}</div>
      ) : (
        <Fragment>
          {todaysShifts.map((shift) => (
            <div className={classes.shift} key={shift._id}>
              <div className={classes.shiftHeader}>
                <span className={classes.shiftName}>{shift.name}</span>
                {!!shift.office && (
                  <span className={classes.office}>
                    {
                      offices?.find((office) => office._id === shift.office)
                        ?.name
                    }
                  </span>
                )}
              </div>
              <div className={classes.values}>
                {getShiftSessions(shift).map((session) => (
                  <div key={session} className={classes.value}>
                    {session}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </Fragment>
      )}

      <div className={classes.summaries}>
        <div className={classes.summary}>
          {getCompContent("nShiftsInXDayOfWeek", [
            todaysShifts.length.toString(),
            getContent(daysOfWeekContentKeys[day]),
          ])}
        </div>
        {todaysShifts.map((shift) => (
          <div
            key={shift._id}
            className={classes.summary}
          >{`${shift.name} (${offices?.find((office) => office._id === shift.office)?.name || ""}): ${numberToTime(shift.start)} - ${numberToTime(shift.end)} * ${getCompContent("xMinutes", [shift.duration.toString()])}`}</div>
        ))}
      </div>
    </div>
  );
};

export default ShiftsPreview;
