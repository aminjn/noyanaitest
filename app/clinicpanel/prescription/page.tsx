import ClinicManagePrescriptionsPage from "@/Components/ClinicPanel/Prescription/ClinicManagePrescriptionsPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const ClinicManagePrescriptions = async () => {
  const textContent = await getScopedTextContent([
    "clinicPanelPrescription",
  ]);
  return (
    <LocaleScopeProvider
      namespaces={["clinicPanelPrescription"]}
      initialTextContent={textContent}
    >
      <ClinicManagePrescriptionsPage />
    </LocaleScopeProvider>
  );
};

export default ClinicManagePrescriptions;
