import classes from "./Replicator.module.css";
import { Dispatch, SetStateAction, useState } from "react";
import {
  daysOfWeekContentKeys,
  DoctorShiftDay,
  doctorShiftDays,
  ShiftContext,
} from "./DoctorManageShiftsPage";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import Button from "@/Components/UI/Button";
import { nanoid } from "nanoid";
import useNotification from "@/Components/Hooks/useNotification";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import { useIntlLocale } from "@/Components/i18n/navigation";

const NS: ContentNamespace[] = ["common", "doctorPanelShift"];

// "Copy this day to…": the picked days get this day's ranges (theirs are
// replaced), as Doctolib's / Google Calendar's "copy to all days".
const Replicator = ({
  day,
  setData,
  onClose,
  onApplied,
}: {
  day: DoctorShiftDay;
  setData: Dispatch<SetStateAction<ShiftContext>>;
  onClose: () => unknown;
  onApplied?: (days: DoctorShiftDay[]) => unknown;
}) => {
  const [selected, setSelected] = useState<DoctorShiftDay[]>([]);
  const getContent = useScopedLocale(NS);
  const pushNotification = useNotification();
  const intlTag = useIntlLocale();
  const others = doctorShiftDays.filter((el) => el !== day);
  const all = selected.length === others.length;

  const apply = () => {
    if (!selected.length) return;
    setData((prev) => {
      const todays = prev.filter((el) => el.day === day);
      const rest = prev.filter((el) => !selected.includes(el.day));
      return [
        ...rest,
        ...selected.flatMap((d) =>
          todays.map((shift) => ({ ...shift, day: d, _id: `${nanoid()}${Date.now()}` })),
        ),
      ];
    });
    onApplied?.(selected);
    pushNotification(getContent("modificationsApplied"), "Success");
    onClose();
  };

  return (
    <div className={classes.main}>
      <div className={classes.head}>
        <span className={classes.title}>{getContent("selectTargetWeekDays")}</span>
        <button
          type="button"
          className={classes.all}
          onClick={() => setSelected(all ? [] : [...others])}
        >
          {all ? getContent("removeAll") : getContent("selectAll")}
        </button>
      </div>
      <div className={classes.days}>
        {others.map((el) => {
          const on = selected.includes(el);
          return (
            <button
              key={el}
              type="button"
              aria-pressed={on}
              className={`${classes.day} ${on ? classes.dayOn : ""}`}
              onClick={() => setSelected((prev) => (on ? prev.filter((d) => d !== el) : [...prev, el]))}
            >
              {getContent(daysOfWeekContentKeys[el])}
            </button>
          );
        })}
      </div>
      <div className={classes.actions}>
        <Button type="button" variant="Neutral" mode="Outline" size="S" onClick={() => onClose()}>
          {getContent("cancel")}
        </Button>
        <Button type="button" size="S" onClick={apply} className={selected.length ? "" : classes.disabled}>
          {getContent("applySettingsOnXDays", [selected.length.toLocaleString(intlTag)])}
        </Button>
      </div>
    </div>
  );
};

export default Replicator;
