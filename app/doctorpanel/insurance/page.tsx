import DoctorManageInsurancesPage from "@/Components/DoctorPanel/Insurance/DoctorManageInsurancesPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const DoctorManageInsurances = async () => {
  const textContent = await getScopedTextContent(["common", "doctorPanelInsurance"]);
  return (
    <LocaleScopeProvider
      namespaces={["common", "doctorPanelInsurance"]}
      initialTextContent={textContent}
    >
      <DoctorManageInsurancesPage />
    </LocaleScopeProvider>
  );
};

export default DoctorManageInsurances;
