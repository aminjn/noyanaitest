import DoctorEditPrescriptionPage from "@/Components/DoctorPanel/Prescription/Edit/DoctorEditPrescriptionPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const EditPrescription = async () => {
  const textContent = await getScopedTextContent([
    "common",
    "doctorPanelPrescriptionEdit",
  ]);
  return (
    <LocaleScopeProvider
      namespaces={["common", "doctorPanelPrescriptionEdit"]}
      initialTextContent={textContent}
    >
      <DoctorEditPrescriptionPage />
    </LocaleScopeProvider>
  );
};

export default EditPrescription;
