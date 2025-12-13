import { Fragment, useContext } from "react";
import classes from "./PrescriptionHeader.module.css";
import useLocale from "@/Components/Hooks/useLocale";
import PrescriptionContext from "../PrescriptionContext";
import Button from "@/Components/UI/Button";
import PatientDetailsPopup from "./PatientDetailsPopup";
import usePopup from "@/Components/Hooks/usePopup";
import ProfileRenderer from "./ProfileRenderer";
const PrescriptionHeader = () => {
  const getContent = useLocale();
  const ctx = useContext(PrescriptionContext);
  const { profile, patient, setProfile } = ctx;

  const { setPopup } = usePopup();

  if (!patient) return null;
  return (
    <Fragment>
      <div className={classes.header}>
        <legend className={classes.title}>
          {getContent("newPrescriptionDetails")}
        </legend>
        {!profile && (
          <Button
            onClick={() =>
              setPopup("PatientDetails", <PatientDetailsPopup ctx={ctx} />)
            }
          >
            {getContent("connectToPatientProfile")}
          </Button>
        )}
      </div>
      <ProfileRenderer />
    </Fragment>
  );
};

export default PrescriptionHeader;
