import DoctorManagePharmaciesPage from "@/Components/DoctorPanel/Pharmacy/DoctorManagePharmaciesPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const DoctorManagePharmacies = async () => {
  const textContent = await getScopedTextContent(["doctorPanelPharmacy"]);
  return (
    <LocaleScopeProvider
      namespaces={["doctorPanelPharmacy"]}
      initialTextContent={textContent}
    >
      <DoctorManagePharmaciesPage />
    </LocaleScopeProvider>
  );
};

export default DoctorManagePharmacies;
