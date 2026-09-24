import DoctorManagePrescriptionsPage from "@/Components/DoctorPanel/Prescription/DoctorManagePrescriptionsPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const DoctorManageDrugsAndPrescriptions = async () => {
  const textContent = await getScopedTextContent([
    "doctorPanelPrescriptionList",
  ]);
  return (
    <LocaleScopeProvider
      namespaces={["doctorPanelPrescriptionList"]}
      initialTextContent={textContent}
    >
      <DoctorManagePrescriptionsPage />
    </LocaleScopeProvider>
  );
};

export default DoctorManageDrugsAndPrescriptions;
