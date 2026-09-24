import DoctorCreatePrescriptionPage from "@/Components/DoctorPanel/Prescription/Create/DoctorCreatePrescriptionPage";
import CreatePrescriptionPage from "@/Components/DoctorPanel/Prescription2/CreatePrescriptionPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const NAMESPACES: ContentNamespace[] = [
  "doctorPanelPrescriptionCreate",
  "doctorPanelPrescriptionDrugItem",
];

const DoctorCreatePrescription = async () => {
  const textContent = await getScopedTextContent(NAMESPACES);
  return (
    <LocaleScopeProvider
      namespaces={NAMESPACES}
      initialTextContent={textContent}
    >
      <CreatePrescriptionPage />
      {/* <DoctorCreatePrescriptionPage /> */}
    </LocaleScopeProvider>
  );
};

export default DoctorCreatePrescription;
