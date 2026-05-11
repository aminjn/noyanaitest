import { useContext } from "react";
import DoctorPrescriptionContext from "./DoctorPrescriptionContext";

const usePrescription = () => {
  const PrescripCtx = useContext(DoctorPrescriptionContext);
  return {
    ...PrescripCtx,
  };
};

export default usePrescription;
