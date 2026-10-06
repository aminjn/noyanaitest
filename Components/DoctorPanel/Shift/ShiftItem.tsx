import { ShiftContext } from "./DoctorManageShiftsPage";
import classes from "./ShiftItem.module.css";
import { Dispatch, SetStateAction, useMemo, useState } from "react";
import { numberToTime } from "../Calendar/AddSessionsAgent";
import { IOffice } from "../Office/DoctorManageOfficesPage";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { doctorSessionTypes, patientStatuses } from "../Calendar/DoctorCalendarDay";
import ShiftsPreview from "./ShiftsPreview";
import useShiftUtils from "./useShiftUtils";
import Ixon from "@/Components/UI/Ixon";
import GarbageIcon from "@/Components/Icons/GarbageIcon";
import AdjustmentHorizontalIcon from "@/Components/Icons/AdjustmentHorizontalIcon";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import { useIntlLocale } from "@/Components/i18n/navigation";

const NS: ContentNamespace[] = ["common", "doctorPanelShift"];

const sessionDurations = [5, 10, 15, 20, 25, 30, 40, 45, 60, 90];
const sessionGaps = [0, 5, 10, 15, 20, 30];

// every 5 minutes of the day (a native select: a wheel on phones, type-ahead
// on desktop), plus the current value if it is off that grid
const times = (current: number, max = 24 * 60) => {
  const out: number[] = [];
  for (let m = 0; m <= max; m += 5) out.push(m);
  if (!out.includes(current)) out.push(current);
  return out.sort((a, b) => a - b);
};

const withCurrent = (list: number[], current: number) =>
  (list.includes(current) ? list : [...list, current]).sort((a, b) => a - b);

// One time range of a day: office, from-to, visit length and the number of
// visits it makes, in one line; name, gap, visit and patient types and the
// visit times behind "more".
const ShiftItem = ({
  shift,
  setData,
  offices,
  overlap,
  tone,
  canEdit,
}: {
  shift: ShiftContext[number];
  setData: Dispatch<SetStateAction<ShiftContext>>;
  offices: IOffice[];
  overlap: boolean;
  tone: string;
  canEdit: boolean;
}) => {
  const getContent = useScopedLocale(NS);
  const intlTag = useIntlLocale();
  const num = useMemo(() => new Intl.NumberFormat(intlTag), [intlTag]);
  const { shiftHasProblem, getShiftSessions } = useShiftUtils();
  const [open, setOpen] = useState(false);

  const problems = useMemo<string[]>(() => {
    const list = shiftHasProblem(shift);
    if (overlap) list.push(getContent("shOverlapRow"));
    return list;
  }, [getContent, overlap, shift, shiftHasProblem]);
  const sessions = getShiftSessions(shift).length;

  const patch = (change: Partial<ShiftContext[number]>) =>
    setData((prev) => prev.map((el) => (el._id === shift._id ? { ...el, ...change } : el)));

  const toggleIn = <T extends string>(list: readonly T[], current: T[], item: T): T[] =>
    list.filter((el) => (el === item ? !current.includes(item) : current.includes(el)));

  const startTimes = useMemo(() => times(shift.start, 24 * 60 - 5), [shift.start]);
  const endTimes = useMemo(() => times(shift.end), [shift.end]);
  const officeName = offices.find((o) => o._id === shift.office)?.name;

  return (
    <div className={`${classes.shift} ${problems.length ? classes.withProblem : ""}`}>
      <div className={classes.line}>
        <span className={`${classes.officeDot} ${tone}`} aria-hidden />
        {offices.length > 1 ? (
          <select
            className={`${classes.select} ${classes.office}`}
            aria-label={getContent("office")}
            disabled={!canEdit}
            value={shift.office || ""}
            onChange={(e) => patch({ office: e.target.value })}
          >
            {!shift.office && <option value="">{getContent("office")}</option>}
            {offices.map((o) => (
              <option key={o._id} value={o._id}>
                {o.name || o._id}
              </option>
            ))}
          </select>
        ) : (
          <span className={classes.officeName}>{officeName || getContent("office")}</span>
        )}

        <span className={classes.times}>
          <select
            className={classes.select}
            aria-label={getContent("startTime")}
            disabled={!canEdit}
            value={shift.start}
            onChange={(e) => patch({ start: Number(e.target.value) })}
          >
            {startTimes.map((m) => (
              <option key={m} value={m}>
                {numberToTime(m)}
              </option>
            ))}
          </select>
          <span className={classes.dash}>–</span>
          <select
            className={classes.select}
            aria-label={getContent("endTime")}
            disabled={!canEdit}
            value={shift.end}
            onChange={(e) => patch({ end: Number(e.target.value) })}
          >
            {endTimes.map((m) => (
              <option key={m} value={m}>
                {numberToTime(m)}
              </option>
            ))}
          </select>
        </span>

        <select
          className={classes.select}
          aria-label={getContent("sessionDuration")}
          title={getContent("sessionDuration")}
          disabled={!canEdit}
          value={shift.duration}
          onChange={(e) => patch({ duration: Number(e.target.value) })}
        >
          {withCurrent(sessionDurations, shift.duration).map((d) => (
            <option key={d} value={d}>
              {getContent("xMinutes", [num.format(d)])}
            </option>
          ))}
        </select>

        <span className={classes.count}>{getContent("xSessions", [num.format(sessions)])}</span>

        <span className={classes.tools}>
          <button
            type="button"
            className={`${classes.iconButton} ${open ? classes.iconButtonOn : ""}`}
            aria-expanded={open}
            aria-label={getContent("shMore")}
            title={getContent("shMore")}
            onClick={() => setOpen((v) => !v)}
          >
            <Ixon width="1.125rem">
              <AdjustmentHorizontalIcon />
            </Ixon>
          </button>
          {canEdit && (
            <button
              type="button"
              className={`${classes.iconButton} ${classes.danger}`}
              aria-label={getContent("deleteShift")}
              title={getContent("deleteShift")}
              onClick={() => setData((prev) => prev.filter((el) => el._id !== shift._id))}
            >
              <Ixon width="1.125rem">
                <GarbageIcon />
              </Ixon>
            </button>
          )}
        </span>
      </div>

      {!open && !!shift.name && <span className={classes.name}>{shift.name}</span>}

      {!!problems.length && (
        <ul className={classes.problems}>
          {problems.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
      )}

      {open && (
        <div className={classes.more}>
          <div className={classes.moreGrid}>
            <label className={classes.field}>
              <span>{getContent("shRangeName")}</span>
              <input
                className={classes.input}
                value={shift.name || ""}
                maxLength={120}
                disabled={!canEdit}
                placeholder={getContent("newShift")}
                onChange={(e) => patch({ name: e.target.value })}
              />
            </label>
            <label className={classes.field}>
              <span>{getContent("sessionsGap")}</span>
              <select
                className={classes.select}
                disabled={!canEdit}
                value={shift.gap}
                onChange={(e) => patch({ gap: Number(e.target.value) })}
              >
                {withCurrent(sessionGaps, shift.gap).map((g) => (
                  <option key={g} value={g}>
                    {getContent("xMinutes", [num.format(g)])}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className={classes.field}>
            <span>{getContent("sessionType")}</span>
            <div className={classes.chips}>
              {doctorSessionTypes.map((t) => (
                <button
                  key={t}
                  type="button"
                  disabled={!canEdit}
                  aria-pressed={shift.sessionTypes.includes(t)}
                  className={`${classes.chip} ${shift.sessionTypes.includes(t) ? classes.chipOn : ""}`}
                  onClick={() => patch({ sessionTypes: toggleIn(doctorSessionTypes, shift.sessionTypes, t) })}
                >
                  {getContent(t)}
                </button>
              ))}
            </div>
          </div>
          <div className={classes.field}>
            <span>{getContent("patientType")}</span>
            <div className={classes.chips}>
              {patientStatuses.map((t) => (
                <button
                  key={t}
                  type="button"
                  disabled={!canEdit}
                  aria-pressed={shift.patientTypes.includes(t)}
                  className={`${classes.chip} ${shift.patientTypes.includes(t) ? classes.chipOn : ""}`}
                  onClick={() => patch({ patientTypes: toggleIn(patientStatuses, shift.patientTypes, t) })}
                >
                  {getContent(t)}
                </button>
              ))}
            </div>
          </div>
          <ShiftsPreview shift={shift} />
        </div>
      )}
    </div>
  );
};

export default ShiftItem;
