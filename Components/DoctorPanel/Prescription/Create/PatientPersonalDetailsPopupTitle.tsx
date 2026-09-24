import classes from "./PatientPersonalDetailsPopupTitle.module.css";
import { PrescriptionCtx } from "../PrescriptionContext";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const LOCALE_NS: ContentNamespace[] = ["common", "doctorPanelPrescriptionEditor"];

const PatientPersonalDetailsPopupTitle = ({
  ctx,
}: {
  ctx: PrescriptionCtx;
}) => {
  const getContent = useScopedLocale(LOCALE_NS);
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
