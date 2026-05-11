import usePrescription from "../Store/usePrescription";
import classes from "./CreatePrescriptionPatient.module.css";
import CreatePrescriptionPatientRenderer from "./CreatePrescriptionPatientRenderer";
import CreatePrescriptionPatinetSelector from "./CreatePrescriptionPatinetSelector";

const CreatePrescriptionPatient = () => {
  return (
    <div className={classes.main}>
      <CreatePrescriptionPatinetSelector />
      <CreatePrescriptionPatientRenderer />
    </div>
  );
};

export default CreatePrescriptionPatient;
