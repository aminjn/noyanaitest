import { Fragment, useContext } from "react";
import classes from "./PrescriptionHeader.module.css";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import PrescriptionContext from "../PrescriptionContext";
import Button from "@/Components/UI/Button";
import PatientDetailsPopup from "./PatientDetailsPopup";
import usePopup from "@/Components/Hooks/usePopup";
import ProfileRenderer from "./ProfileRenderer";

const LOCALE_NS: ContentNamespace[] = ["common", "doctorPanelPrescriptionEditor"];
const PrescriptionHeader = () => {
  const getContent = useScopedLocale(LOCALE_NS);
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
