import DoctorCreatePrescriptionPage from "@/Components/DoctorPanel/Prescription/Create/DoctorCreatePrescriptionPage";
import CreatePrescriptionPage from "@/Components/DoctorPanel/Prescription2/CreatePrescriptionPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const DoctorCreatePrescription = async () => {
  const textContent = await getScopedTextContent([
    "common",
    "doctorPanelPrescriptionCreate",
  ]);
  return (
    <LocaleScopeProvider
      namespaces={["common", "doctorPanelPrescriptionCreate"]}
      initialTextContent={textContent}
    >
      <CreatePrescriptionPage />
      {/* <DoctorCreatePrescriptionPage /> */}
    </LocaleScopeProvider>
  );
};

export default DoctorCreatePrescription;
