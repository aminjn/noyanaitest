import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ShiftContext } from "./DoctorManageShiftsPage";
import classes from "./ShiftsPreview.module.css";
import useShiftUtils from "./useShiftUtils";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const NS: ContentNamespace[] = ["common", "doctorPanelShift"];

// The visit start times a range makes (what patients will be offered).
const ShiftsPreview = ({ shift }: { shift: ShiftContext[number] }) => {
  const { getShiftSessions } = useShiftUtils();
  const getContent = useScopedLocale(NS);
  const sessions = getShiftSessions(shift);
  if (!sessions.length) return null;
  return (
    <div className={classes.main}>
      <span className={classes.title}>{getContent("shVisitTimes")}</span>
      <div className={classes.values}>
        {sessions.map((session) => (
          <span key={session} className={classes.value} dir="ltr">
            {session}
          </span>
        ))}
      </div>
    </div>
  );
};

export default ShiftsPreview;
