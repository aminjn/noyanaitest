import { Dispatch, SetStateAction, useMemo, useState } from "react";
import classes from "./DayShifts.module.css";
import {
  daysOfWeekContentKeys,
  DoctorShiftDay,
  ShiftContext,
} from "./DoctorManageShiftsPage";
import useComplexLocale from "@/Components/Hooks/useComplexLocale";
import useLocale from "@/Components/Hooks/useLocale";
import ToggleInput from "@/Components/UI/ToggleInput";
import Button from "@/Components/UI/Button";
import PlusIcon from "@/Components/Icons/PlusIcon";
import { nanoid } from "nanoid";
import ProTip from "@/Components/UI/ProTip";
import Replicator from "./Replicator";
import ShiftItem from "./ShiftItem";
import ShiftsPreview from "./ShiftsPreview";

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
  const getCompContent = useComplexLocale();
  const getContent = useLocale();

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
            {/* TODO: calc this */}
            <ToggleInput
              title={getContent("active")}
              value={offDays.includes(day)}
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
