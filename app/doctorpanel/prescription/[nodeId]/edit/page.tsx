import DoctorEditPrescriptionPage from "@/Components/DoctorPanel/Prescription/Edit/DoctorEditPrescriptionPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const NAMESPACES: ContentNamespace[] = [
  "doctorPanelPrescriptionEdit",
  "doctorPanelPrescriptionEditor",
  "doctorPanelPrescriptionDrugItem",
];

const EditPrescription = async () => {
  const textContent = await getScopedTextContent(NAMESPACES);
  return (
    <LocaleScopeProvider
      namespaces={NAMESPACES}
      initialTextContent={textContent}
    >
      <DoctorEditPrescriptionPage />
    </LocaleScopeProvider>
  );
};

export default EditPrescription;
