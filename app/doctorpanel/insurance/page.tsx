import DoctorManageInsurancesPage from "@/Components/DoctorPanel/Insurance/DoctorManageInsurancesPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const DoctorManageInsurances = async () => {
  const textContent = await getScopedTextContent(["doctorPanelInsurance"]);
  return (
    <LocaleScopeProvider
      namespaces={["doctorPanelInsurance"]}
      initialTextContent={textContent}
    >
      <DoctorManageInsurancesPage />
    </LocaleScopeProvider>
  );
};

export default DoctorManageInsurances;
