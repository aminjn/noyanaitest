"use client";

import classes from "./CreatePrescriptionPage.module.css";
import { DoctorPrescriptionContextProvider } from "./Store/DoctorPrescriptionContext";
import Prescription2Agent from "./Prescription2Agent";
import { LoadedPrescription2 } from "./Preview/PreviewPrescription2Page";
import useBreadCrump from "@/Components/Hooks/useBreadCrump";
import useLocale from "@/Components/Hooks/useLocale";

const CreatePrescriptionPage = ({
  defaultValue,
}: {
  defaultValue?: LoadedPrescription2;
}) => {
  const getContent = useLocale();

  useBreadCrump([
    { title: getContent("dashboard"), target: "/doctorpanel" },
    { title: getContent("drugsAndPrescriptions"), target: "/doctorpanel/drug" },
    {
      title: getContent(
        defaultValue ? "prescriptionDetails" : "createNewPrescription",
      ),
      target: defaultValue
        ? `/doctorpanel/prescription/${defaultValue._id}`
        : "/doctorpanel/prescription",
    },
  ]);

  return (
    <DoctorPrescriptionContextProvider defaultValue={defaultValue}>
      <Prescription2Agent />
    </DoctorPrescriptionContextProvider>
  );
};

export default CreatePrescriptionPage;
