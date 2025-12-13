import classes from "./PatientPersonalDetailsPopupTitle.module.css";
import { PrescriptionCtx } from "../PrescriptionContext";
import useLocale from "@/Components/Hooks/useLocale";

const PatientPersonalDetailsPopupTitle = ({
  ctx,
}: {
  ctx: PrescriptionCtx;
}) => {
  const getContent = useLocale();
  const { patient } = ctx;
  if (!patient) return null;
  return (
    <div className={classes.patientDetails}>
      <span className={classes.label}>{getContent("nationalId")}</span>
      <span className={classes.value}>{patient.nationalId}</span>
      <span
        className={classes.name}
      >{`${patient.givenName} ${patient.lastName}`}</span>
    </div>
  );
};

export default PatientPersonalDetailsPopupTitle;
