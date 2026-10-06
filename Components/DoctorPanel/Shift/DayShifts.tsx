import { Dispatch, SetStateAction, useMemo, useState } from "react";
import classes from "./DayShifts.module.css";
import {
  daysOfWeekContentKeys,
  DoctorShiftDay,
  ShiftContext,
} from "./DoctorManageShiftsPage";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import ToggleInput from "@/Components/UI/ToggleInput";
import PlusIcon from "@/Components/Icons/PlusIcon";
import CopyIcon from "@/Components/Icons/CopyIcon";
import Ixon from "@/Components/UI/Ixon";
import { nanoid } from "nanoid";
import Replicator from "./Replicator";
import ShiftItem from "./ShiftItem";
import DayTrack, { HourAxis } from "./WeekOverview";
import useShiftUtils from "./useShiftUtils";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import { IOffice } from "../Office/DoctorManageOfficesPage";
import { useIntlLocale } from "@/Components/i18n/navigation";

const NS: ContentNamespace[] = ["common", "doctorPanelShift"];

const newId = () => `${nanoid()}${Date.now()}`;

// One weekday of the weekly hours (Doctolib "horaires" / Google Calendar
// "weekly hours" row): on/off switch, its time ranges inline, add a range,
// copy the day to other days, and the day's bar on the week's hour axis.
const DayShifts = ({
  day,
  data,
  setData,
  offDays,
  setOffDays,
  offices,
  overlaps,
  axis,
  toneOf,
  canEdit,
}: {
  day: DoctorShiftDay;
  data: ShiftContext;
  setData: Dispatch<SetStateAction<ShiftContext>>;
  offDays: DoctorShiftDay[];
  setOffDays: Dispatch<SetStateAction<DoctorShiftDay[]>>;
  offices: IOffice[];
  overlaps: Set<string>;
  axis: HourAxis;
  toneOf: (officeId?: string) => string;
  canEdit: boolean;
}) => {
  const getContent = useScopedLocale(NS);
  const intlTag = useIntlLocale();
  const num = useMemo(() => new Intl.NumberFormat(intlTag), [intlTag]);
  const { getShiftSessions } = useShiftUtils();
  const [copyOpen, setCopyOpen] = useState(false);

  const todaysShifts = useMemo<ShiftContext>(
    () => data.filter((shift) => shift.day === day).sort((a, b) => a.start - b.start),
    [data, day],
  );
  const switchedOff = offDays.includes(day);
  const on = !switchedOff && todaysShifts.length > 0;
  const sessions = on ? todaysShifts.reduce((acc, el) => acc + getShiftSessions(el).length, 0) : 0;

  // a new range starts where the day's last one ends, at the same office
  // and with the same visit settings; the first one of a day at the office
  // the doctor used last (or the first active office)
  const defaultOffice =
    [...data].reverse().find((shift) => shift.office)?.office ||
    (offices.find((el) => el?.active) || offices[0])?._id;

  const addRange = () => {
    const last = todaysShifts[todaysShifts.length - 1];
    const start = last ? Math.min(last.end + 60, 23 * 60) : 9 * 60;
    const end = Math.min(start + 4 * 60, 24 * 60);
    setData((prev) => [
      ...prev,
      {
        _id: newId(),
        day,
        office: last?.office || defaultOffice,
        start,
        end,
        gap: last?.gap ?? 0,
        duration: last?.duration ?? 20,
        patientTypes: last?.patientTypes?.length ? [...last.patientTypes] : ["newPatient", "oldPatient"],
        sessionTypes: last?.sessionTypes?.length
          ? [...last.sessionTypes]
          : ["inPerson", "sipCall", "textChat", "videoCall", "voiceCall"],
        name: "",
      },
    ]);
  };

  const toggle = () => {
    if (on) return setOffDays((prev) => [...prev, day]);
    if (switchedOff) {
      setOffDays((prev) => prev.filter((d) => d !== day));
      if (todaysShifts.length) return;
    }
    // switching on an empty day: the hours of the nearest earlier day that
    // has some (most practices repeat the same day), else one range
    const order = [1, 2, 3, 4, 5, 6].map((i) => ((day - i + 7) % 7) as DoctorShiftDay);
    const source = order.find(
      (d) => !offDays.includes(d) && data.some((s) => s.day === d),
    );
    if (source === undefined) return addRange();
    setData((prev) => [
      ...prev,
      ...prev.filter((s) => s.day === source).map((s) => ({ ...s, _id: newId(), day })),
    ]);
  };

  const dayName = getContent(daysOfWeekContentKeys[day]);

  return (
    <div id={`shift-day-${day}`} className={`${classes.row} ${on ? "" : classes.rowOff}`}>
      <div className={classes.dayCol}>
        <ToggleInput
          title={dayName}
          value={on}
          readOnly={!canEdit}
          onChange={toggle}
          className={classes.dayToggle}
        />
        {on && <small className={classes.dayMeta}>{getContent("xSessions", [num.format(sessions)])}</small>}
      </div>

      <div className={classes.body}>
        {on ? (
          <div className={classes.ranges}>
            {todaysShifts.map((shift) => (
              <ShiftItem
                key={shift._id}
                setData={setData}
                shift={shift}
                offices={offices}
                overlap={overlaps.has(shift._id)}
                tone={toneOf(shift.office)}
                canEdit={canEdit}
              />
            ))}
          </div>
        ) : (
          <p className={classes.offText}>
            {switchedOff ? getContent("shOffPending") : getContent("offDay")}
          </p>
        )}

        <div className={classes.footer}>
          <DayTrack shifts={todaysShifts} axis={axis} toneOf={toneOf} off={!on} />
          {canEdit && on && (
            <div className={classes.dayActions}>
              <button type="button" className={classes.linkButton} onClick={addRange}>
                <Ixon width="1rem">
                  <PlusIcon />
                </Ixon>
                {getContent("shAddRange")}
              </button>
              <button
                type="button"
                className={classes.linkButton}
                aria-expanded={copyOpen}
                onClick={() => setCopyOpen((v) => !v)}
              >
                <Ixon width="1rem">
                  <CopyIcon />
                </Ixon>
                {getContent("shCopyTo")}
              </button>
            </div>
          )}
        </div>
        {copyOpen && on && (
          <Replicator
            day={day}
            setData={setData}
            onClose={() => setCopyOpen(false)}
            onApplied={(days) =>
              // copying onto a day switches it on
              setOffDays((prev) => prev.filter((d) => !days.includes(d)))
            }
          />
        )}
      </div>
    </div>
  );
};

export default DayShifts;
