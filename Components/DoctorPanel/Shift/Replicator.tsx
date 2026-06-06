import classes from "./Replicator.module.css";
import { Dispatch, SetStateAction, useMemo, useState } from "react";
import {
  daysOfWeekContentKeys,
  DoctorShiftDay,
  doctorShiftDays,
  ShiftContext,
} from "./DoctorManageShiftsPage";
import useLocale from "@/Components/Hooks/useLocale";
import Button from "@/Components/UI/Button";
import { nanoid } from "nanoid";
import useNotification from "@/Components/Hooks/useNotification";

const Replicator = ({
  day,
  data,
  setData,
}: {
  day: DoctorShiftDay;
  data: ShiftContext;
  setData: Dispatch<SetStateAction<ShiftContext>>;
}) => {
  const [seletcedDays, setSelectedDays] = useState<DoctorShiftDay[]>([]);

  const [isOpen, setIsOpen] = useState<boolean>(false);

  const getContent = useLocale();

  const pushNotification = useNotification();

  return (
    <div className={`${classes.main}`}>
      <Button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={classes.toggle}
      >
        {getContent("applyTheseSettingsOnDesiredDays")}
      </Button>
      {isOpen && (
        <div className={classes.content}>
          <span className={classes.title}>
            {getContent("selectTargetWeekDays")}
          </span>
          <div className={classes.days}>
            {doctorShiftDays
              .filter((el) => el !== day)
              .map((el) => (
                <Button
                  key={`Day${el}`}
                  variant={seletcedDays.includes(el) ? "Primary" : "Neutral"}
                  type="button"
                  onClick={() =>
                    setSelectedDays((prev) => {
                      const clone = [...prev];
                      const index = clone.indexOf(el);
                      if (index === -1) clone.push(el);
                      else {
                        clone.splice(index, 1);
                      }
                      return clone;
                    })
                  }
                >
                  {getContent(daysOfWeekContentKeys[el])}
                </Button>
              ))}
          </div>
          <div className={classes.actions}>
            <div className={classes.actionGroup}>
              <Button
                variant={"Secondary"}
                onClick={() =>
                  setSelectedDays(doctorShiftDays.filter((el) => el !== day))
                }
                type="button"
              >
                {getContent("selectAll")}
              </Button>
              <Button
                type="button"
                variant="Secondary"
                onClick={() => setSelectedDays([])}
              >
                {getContent("removeAll")}
              </Button>
            </div>
            <div className={classes.actionGroup}>
              <Button
                type="button"
                variant="Neutral"
                onClick={() => setIsOpen(false)}
              >
                {getContent("cancel")}
              </Button>
              <Button
                type="button"
                variant="Primary"
                onClick={() => {
                  setData((prev) => {
                    const clone = [...prev];
                    const todaysShifts = clone.filter((el) => el.day === day);
                    const otherDaysShifts = clone.filter(
                      (el) => day !== el.day && !seletcedDays.includes(el.day),
                    );
                    const result: ShiftContext = [
                      ...todaysShifts,
                      ...otherDaysShifts,
                    ];
                    for (const _day of seletcedDays) {
                      result.push(
                        ...todaysShifts.map((shift) => ({
                          ...shift,
                          day: _day,
                          _id: `${nanoid()}${new Date().getTime()}`,
                        })),
                      );
                    }
                    return result;
                  });
                  pushNotification(getContent("modificationsApplied"));
                  setIsOpen(false);
                }}
              >
                {getContent("applySettingsOnXDays")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Replicator;
