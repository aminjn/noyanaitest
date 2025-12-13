"use client";

import classes from "./DoctorCreatePrescriptionPage.module.css";
import WithTitle from "@/Components/Admin/UI/WithTitle";
import useLocale from "@/Components/Hooks/useLocale";
import usePopup from "@/Components/Hooks/usePopup";
import CreatePatientPopup from "./CreatePatientPopup";
import PrescriptionContext, {
  PrescriptionContextProvider,
} from "../PrescriptionContext";
import { useContext } from "react";
import PrescriptionPatientManager from "./PrescriptionPatientManager";
import PrescriptionItemGetterAgent from "./Items/PrescriptionItemGetterAgent";

const Inner = () => {
  const getContent = useLocale();

  useContext(PrescriptionContext);

  const { setPopup } = usePopup();
  return (
    <WithTitle
      title={getContent("createNewPrescription")}
      actions={[
        {
          title: getContent("addPatient"),
          action: () => setPopup("CreatePatient", <CreatePatientPopup />),
        },
      ]}
    >
      <PrescriptionPatientManager />
      <PrescriptionItemGetterAgent />
    </WithTitle>
  );
};

const DoctorCreatePrescriptionPage = () => {
  return (
    <PrescriptionContextProvider>
      <Inner />
    </PrescriptionContextProvider>
  );
};

export default DoctorCreatePrescriptionPage;
