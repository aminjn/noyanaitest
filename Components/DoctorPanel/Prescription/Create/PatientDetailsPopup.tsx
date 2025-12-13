import classes from "./PatientDetailsPopup.module.css";
import usePopup from "@/Components/Hooks/usePopup";
import Ixon from "@/Components/UI/Ixon";
import CloseIcon from "@/Components/Icons/CloseIcon";
import useLocale from "@/Components/Hooks/useLocale";
import AlertCircleIcon from "@/Components/Icons/AlertCircleIcon";
import ClientTabSystem from "@/Components/UI/ClientTabSystem";
import PatientProfilesTab from "./PatientProfilesTab";
import { PrescriptionCtx } from "../PrescriptionContext";
import PatientPersonalDetailsPopupTitle from "./PatientPersonalDetailsPopupTitle";
import PrescriptionProTip from "./PrescriptionProTip";
const PatientDetailsPopup = ({ ctx }: { ctx: PrescriptionCtx }) => {
  const { closePopup } = usePopup();

  const getContent = useLocale();

  const { patient } = ctx;

  if (!patient) return null;
  return (
    <div className={classes.main}>
      <div className={classes.header}>
        <button
          type="button"
          onClick={() => closePopup("PatientDetails")}
          className={classes.close}
        >
          <Ixon width="1.5rem">
            <CloseIcon />
          </Ixon>
        </button>
        <PatientPersonalDetailsPopupTitle ctx={ctx} />
      </div>
      <PrescriptionProTip />
      <ClientTabSystem
        items={[
          {
            id: "Profiles",
            title: getContent("patientProfilesList"),
            content: <PatientProfilesTab ctx={ctx} />,
          },
          {
            id: "Medications",
            title: getContent("medicationsList"),
            content: <p>Medications</p>,
          },
          {
            id: "Details",
            content: <p>medicalDetails</p>,
            title: (
              <span className={classes.details}>
                <span>{getContent("medicalDetails")}</span>
                <Ixon width="1.25rem">
                  <AlertCircleIcon />
                </Ixon>
              </span>
            ),
          },
          {
            id: "Vitals",
            content: <p>vitals</p>,
            title: getContent("vitalCauses"),
          },
        ]}
      />
    </div>
  );
};

export default PatientDetailsPopup;
