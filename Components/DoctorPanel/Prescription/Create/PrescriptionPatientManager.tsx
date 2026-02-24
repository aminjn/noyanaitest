import { useContext } from "react";
import classes from "./PrescriptionPatientManager.module.css";
import PrescriptionContext from "../PrescriptionContext";
import useLocale from "@/Components/Hooks/useLocale";
import PatientSelector from "./PatientSelector";
import PatientRenderer from "./PatientRenderer";
import Button from "@/Components/UI/Button";
import usePopup from "@/Components/Hooks/usePopup";
import PatientDetailsPopup from "./PatientDetailsPopup";
import PrescriptionHeader from "./PrescriptionHeader";
const PrescriptionPatientManager = () => {
  return (
    <div className={classes.main}>
      <PatientSelector style={{ marginBottom: "1.25rem" }} />
      <PatientRenderer />
      {/* <PrescriptionHeader /> */}
    </div>
  );
};

export default PrescriptionPatientManager;
