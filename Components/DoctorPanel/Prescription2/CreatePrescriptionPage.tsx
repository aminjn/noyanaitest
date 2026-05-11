"use client";

import classes from "./CreatePrescriptionPage.module.css";
import { DoctorPrescriptionContextProvider } from "./Store/DoctorPrescriptionContext";
import Prescription2Agent from "./Prescription2Agent";
import { LoadedPrescription2 } from "./Preview/PreviewPrescription2Page";

const CreatePrescriptionPage = ({
  defaultValue,
}: {
  defaultValue?: LoadedPrescription2;
}) => {
  return (
    <DoctorPrescriptionContextProvider defaultValue={defaultValue}>
      <Prescription2Agent />
    </DoctorPrescriptionContextProvider>
  );
};

export default CreatePrescriptionPage;
