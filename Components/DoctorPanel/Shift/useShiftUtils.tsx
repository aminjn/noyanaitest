import { useCallback } from "react";
import { ShiftContext } from "./DoctorManageShiftsPage";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { numberToTime } from "../Calendar/AddSessionsAgent";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const NS: ContentNamespace[] = ["common", "doctorPanelShiftUtils"];

const useShiftUtils = () => {
  const getContent = useScopedLocale(NS);

  const getShiftSessions = useCallback(
    (shift: ShiftContext[number]): string[] => {
      const result: string[] = [];
      if (shift.start >= shift.end) return [];
      let now = shift.start;
      result.push(numberToTime(now));
      now += shift.duration + shift.gap;
      while (now <= shift.end - shift.duration) {
        result.push(numberToTime(now));
        now += shift.duration + shift.gap;
      }
      return result;
    },
    [],
  );

  const getShiftSessionBounds = useCallback(
    (shift: ShiftContext[number]): [number, number][] => {
      const result: [number, number][] = [];
      if (shift.start >= shift.end) return [];
      let now = shift.start;
      result.push([now, now + shift.duration]);
      now += shift.duration + shift.gap;
      while (now <= shift.end - shift.duration) {
        result.push([now, now + shift.duration]);
        now += shift.duration + shift.gap;
      }
      return result;
    },
    [],
  );

  const shiftHasProblem = useCallback(
    (shift: ShiftContext[number]): string[] => {
      const problems: string[] = [];
      if (shift.start >= shift.end)
        problems.push(getContent("shiftStartMustBeBeforeEnd"));
      if (!shift.office) problems.push(getContent("missingShiftOffice"));
      if (!shift.patientTypes)
        problems.push(getContent("missingShiftPatientStatus"));
      if (!shift.sessionTypes)
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
