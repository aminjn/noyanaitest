import { ShiftContext } from "./DoctorManageShiftsPage";
import classes from "./ShiftItem.module.css";
import { Dispatch, SetStateAction, useMemo } from "react";
import { IOffice } from "../Office/DoctorManageOfficesPage";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { doctorSessionTypes, patientStatuses } from "../Calendar/DoctorCalendarDay";
import ShiftsPreview from "./ShiftsPreview";
import useShiftUtils from "./useShiftUtils";
import BottomSheet from "@/Components/UI/BottomSheet";
import Button from "@/Components/UI/Button";
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

// "9:00" in the reader's digits
export const useClock = () => {
  const intlTag = useIntlLocale();
  return useMemo(() => {
    const num = new Intl.NumberFormat(intlTag);
    const zero = num.format(0);
    return (m: number) => `${num.format(Math.floor(m / 60))}:${num.format(m % 60).padStart(2, zero)}`;
  }, [intlTag]);
};

// What is wrong with a range (the same checks as saving), the inactive
// office included: a range there takes no bookings (Lib/doctorOffer.ts).
const useProblems = (shift: ShiftContext[number], offices: IOffice[], overlap: boolean) => {
  const getContent = useScopedLocale(NS);
  const { shiftHasProblem } = useShiftUtils();
  return useMemo<string[]>(() => {
    const list = shiftHasProblem(shift);
    if (overlap) list.push(getContent("shOverlapRow"));
    const at = offices.find((o) => o._id === shift.office);
    if (at && at.active === false) list.push(getContent("shInactiveOfficeRow"));
    return list;
  }, [getContent, offices, overlap, shift, shiftHasProblem]);
};

// One time range of a weekday as a short chip - «سعادت · ۹:۰۰–۱۳:۰۰ ·
// ۲۰ دقیقه · حضوری» - with its office's colour dot; tapping it opens the
// range's editor (a sheet on a phone, a dialog on a desktop) with every
// setting: office, from-to, visit length, gap, visit and patient types, the
// visit times it makes, and delete.
const ShiftItem = ({
  shift,
  setData,
  offices,
  overlap,
  tone,
  canEdit,
  open,
  onOpen,
  onClose,
}: {
  shift: ShiftContext[number];
  setData: Dispatch<SetStateAction<ShiftContext>>;
  offices: IOffice[];
  overlap: boolean;
  tone: string;
  canEdit: boolean;
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
}) => {
  const getContent = useScopedLocale(NS);
  const intlTag = useIntlLocale();
  const num = useMemo(() => new Intl.NumberFormat(intlTag), [intlTag]);
  const clock = useClock();
  const { getShiftSessions } = useShiftUtils();
  const problems = useProblems(shift, offices, overlap);
  const sessions = getShiftSessions(shift).length;

  const patch = (change: Partial<ShiftContext[number]>) =>
    setData((prev) => prev.map((el) => (el._id === shift._id ? { ...el, ...change } : el)));

  const toggleIn = <T extends string>(list: readonly T[], current: T[], item: T): T[] =>
    list.filter((el) => (el === item ? !current.includes(item) : current.includes(el)));

  const startTimes = useMemo(() => times(shift.start, 24 * 60 - 5), [shift.start]);
  const endTimes = useMemo(() => times(shift.end), [shift.end]);
  const office = offices.find((o) => o._id === shift.office);
  const inactive = office?.active === false;
  const types = doctorSessionTypes.filter((t) => shift.sessionTypes.includes(t));
  // the visit types in short: one named, the rest counted
  const typeText = !types.length
    ? ""
    : types.length === doctorSessionTypes.length
      ? getContent("hcAllTypes")
      : `${getContent(types.includes("inPerson") ? "inPerson" : types[0])}${types.length > 1 ? ` +${num.format(types.length - 1)}` : ""}`;

  // each part isolated (a Persian office name in an English page, a time
  // in an RTL one), the time always left to right
  const parts = [
    office?.name || getContent("office"),
    `\u2066${clock(shift.start)}–${clock(shift.end)}\u2069`,
    getContent("xMinutes", [num.format(shift.duration)]),
    typeText,
  ].filter(Boolean);
  const label = parts.map((p) => `\u2068${p}\u2069`).join(" · ");

  return (
    <>
      <button
        type="button"
        className={`${classes.chip} ${problems.length ? classes.chipProblem : ""} ${inactive ? classes.chipInactive : ""}`}
        onClick={onOpen}
        aria-haspopup="dialog"
        title={[label, ...problems].join("\n")}
      >
        <span className={`${classes.officeDot} ${tone}`} aria-hidden />
        <span className={classes.chipText}>{label}</span>
        {inactive && <span className={classes.chipFlag}>{getContent("inactive")}</span>}
        {!!problems.length && !inactive && (
          <span className={classes.chipAlert} aria-label={problems[0]}>
            !
          </span>
        )}
      </button>

      <BottomSheet
        open={open}
        onClose={onClose}
        closeLabel={getContent("close")}
        title={getContent("hcEditRange")}
        subtitle={`${label} · ${getContent("xSessions", [num.format(sessions)])}`}
        footer={
          <div className={classes.footer}>
            {canEdit && (
              <Button
                type="button"
                variant="Error"
                mode="Outline"
                size="M"
                onClick={() => {
                  onClose();
                  setData((prev) => prev.filter((el) => el._id !== shift._id));
                }}
              >
                {getContent("deleteShift")}
              </Button>
            )}
            <Button type="button" size="M" onClick={onClose}>
              {getContent("hcRangeDone")}
            </Button>
          </div>
        }
      >
        <div className={classes.editor}>
          <label className={classes.field}>
            <span>{getContent("office")}</span>
            <span className={classes.officeRow}>
              <span className={`${classes.officeDot} ${tone}`} aria-hidden />
              <select
                className={classes.select}
                disabled={!canEdit}
                value={shift.office || ""}
                onChange={(e) => patch({ office: e.target.value })}
              >
                {!shift.office && <option value="">{getContent("office")}</option>}
                {offices.map((o) => (
                  <option key={o._id} value={o._id}>
                    {o.active === false ? `${o.name || o._id} (${getContent("inactive")})` : o.name || o._id}
                  </option>
                ))}
              </select>
            </span>
          </label>

          <div className={classes.grid}>
            <label className={classes.field}>
              <span>{getContent("startTime")}</span>
              <select
                className={classes.select}
                disabled={!canEdit}
                value={shift.start}
                onChange={(e) => patch({ start: Number(e.target.value) })}
              >
                {startTimes.map((m) => (
                  <option key={m} value={m}>
                    {clock(m)}
                  </option>
                ))}
              </select>
            </label>
            <label className={classes.field}>
              <span>{getContent("endTime")}</span>
              <select
                className={classes.select}
                disabled={!canEdit}
                value={shift.end}
                onChange={(e) => patch({ end: Number(e.target.value) })}
              >
                {endTimes.map((m) => (
                  <option key={m} value={m}>
                    {clock(m)}
                  </option>
                ))}
              </select>
            </label>
            <label className={classes.field}>
              <span>{getContent("sessionDuration")}</span>
              <select
                className={classes.select}
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
                  className={`${classes.opt} ${shift.sessionTypes.includes(t) ? classes.optOn : ""}`}
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
                  className={`${classes.opt} ${shift.patientTypes.includes(t) ? classes.optOn : ""}`}
                  onClick={() => patch({ patientTypes: toggleIn(patientStatuses, shift.patientTypes, t) })}
                >
                  {getContent(t)}
                </button>
              ))}
            </div>
          </div>

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

          {!!problems.length && (
            <ul className={classes.problems}>
              {problems.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          )}

          <ShiftsPreview shift={shift} />
        </div>
      </BottomSheet>
    </>
  );
};

export default ShiftItem;
