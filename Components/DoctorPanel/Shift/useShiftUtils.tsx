import { useCallback } from "react";
import { ShiftContext } from "./DoctorManageShiftsPage";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { numberToTime } from "../Calendar/AddSessionsAgent";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const NS: ContentNamespace[] = ["common", "doctorPanelShiftUtils"];

const useShiftUtils = () => {
  const getContent = useScopedLocale(NS);

  // same rule as the API (Lib/shiftUtils.ts): back-to-back visits of
  // `duration` minutes with `gap` between them, each ending inside the shift
  const getShiftSessionBounds = useCallback(
    (shift: Pick<ShiftContext[number], "start" | "end" | "duration" | "gap">): [number, number][] => {
      const result: [number, number][] = [];
      const duration = Number(shift?.duration) || 0;
      const step = duration + Math.max(0, Number(shift?.gap) || 0);
      if (duration <= 0 || !(shift.start < shift.end)) return result;
      for (let now = shift.start; now + duration <= shift.end; now += step) {
        result.push([now, now + duration]);
      }
      return result;
    },
    [],
  );

  const getShiftSessions = useCallback(
    (shift: Pick<ShiftContext[number], "start" | "end" | "duration" | "gap">): string[] =>
      getShiftSessionBounds(shift).map(([start]) => numberToTime(start)),
    [getShiftSessionBounds],
  );

  const shiftHasProblem = useCallback(
    (shift: ShiftContext[number]): string[] => {
      const problems: string[] = [];
      if (shift.start >= shift.end)
        problems.push(getContent("shiftStartMustBeBeforeEnd"));
      if (!shift.office) problems.push(getContent("missingShiftOffice"));
      if (!shift.patientTypes?.length)
        problems.push(getContent("missingShiftPatientStatus"));
      if (!shift.sessionTypes?.length)
        problems.push(getContent("missingShiftSessionType"));
      if (!getShiftSessions(shift).length)
        problems.push(getContent("shiftIsEmpty"));
      return problems;
    },
    [getContent, getShiftSessions],
  );

  return { getShiftSessions, shiftHasProblem, getShiftSessionBounds };
};

export default useShiftUtils;
