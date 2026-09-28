import { Dispatch, SetStateAction, useMemo, useState } from "react";
import classes from "./DayShifts.module.css";
import {
  daysOfWeekContentKeys,
  DoctorShiftDay,
  ShiftContext,
} from "./DoctorManageShiftsPage";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import ToggleInput from "@/Components/UI/ToggleInput";
import Button from "@/Components/UI/Button";
import PlusIcon from "@/Components/Icons/PlusIcon";
import { nanoid } from "nanoid";
import ProTip from "@/Components/UI/ProTip";
import Replicator from "./Replicator";
import ShiftItem from "./ShiftItem";
import ShiftsPreview from "./ShiftsPreview";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import { IOffice } from "../Office/DoctorManageOfficesPage";

const NS: ContentNamespace[] = ["common", "doctorPanelShift"];

const DayShifts = ({
  day,
  data,
  setData,
  offDays,
  setOffDays,
}: {
  day: DoctorShiftDay;
  data: ShiftContext;
  setData: Dispatch<SetStateAction<ShiftContext>>;
  offDays: DoctorShiftDay[];
  setOffDays: Dispatch<SetStateAction<DoctorShiftDay[]>>;
}) => {
  const getCompContent = useScopedLocale(NS);
  const getContent = useScopedLocale(NS);

  // same key as ShiftItem's office list, so SWR serves it from cache
  const { data: officesData } = useSWR<IOffice[]>(
    `${API}/doctor/office`,
    (url: string) => fetcher({ url }).then((res) => res.data),
  );
  const offices = Array.isArray(officesData) ? officesData : [];
  // a new shift starts at the office the doctor used last on this day (or
  // any active office), instead of empty and flagged as an error
  const defaultOffice =
    [...data].reverse().find((shift) => shift.day === day && shift.office)
      ?.office ||
    (offices.find((el) => el?.active) || offices[0])?._id;

  const todaysShifts = useMemo<ShiftContext>(
    () => data.filter((shift) => shift.day === day),
    [data, day],
  );

  return (
    <div className={classes.main}>
      <div className={classes.shiftsBox}>
        <div className={classes.header}>
          <span className={classes.mainTitle}>
            {getCompContent("xDaySettings", [
              getContent(daysOfWeekContentKeys[day]),
            ])}
          </span>
          <div className={classes.activeBox}>
            {/* on = the day takes bookings; off = a day off */}
            <ToggleInput
              title={getContent("active")}
              value={!offDays.includes(day)}
              onChange={() =>
                setOffDays((prev) => {
                  const clone = [...prev];
                  const index = offDays.indexOf(day);
                  if (index === -1) {
                    clone.push(day);
                  } else {
                    clone.splice(index, 1);
                  }
                  return clone;
                })
              }
            />
          </div>
        </div>
        <ProTip>{getContent("shiftsProTip")}</ProTip>
        <div
          className={`${classes.shiftsBoxInner} ${offDays.includes(day) ? classes.off : ""}`}
        >
          <div className={`${classes.shifts}`}>
            {todaysShifts.map((shift) => (
              <ShiftItem
                key={shift._id}
                setData={setData}
                shift={{ ...shift }}
              />
            ))}
            <Button
              leadIcon={<PlusIcon />}
              type="button"
              variant="Primary"
              mode="Outline"
              onClick={() =>
                setData((prev) => [
                  ...prev,
                  {
                    _id: `${nanoid()}${new Date().getTime()}`,
                    day,
                    office: defaultOffice,
                    end: 1200,
                    start: 480,
                    gap: 0,
                    duration: 20,
                    patientTypes: ["newPatient", "oldPatient"],
                    sessionTypes: [
                      "inPerson",
                      "sipCall",
                      "textChat",
                      "videoCall",
                      "voiceCall",
                    ],
                    name: getContent("newShift"),
                  },
                ])
              }
            >
              {getContent("addANewShift")}
            </Button>
          </div>
          <Replicator data={data} day={day} setData={setData} />
        </div>
      </div>
      <ShiftsPreview off={offDays.includes(day)} data={data} day={day} />
    </div>
  );
};

export default DayShifts;
