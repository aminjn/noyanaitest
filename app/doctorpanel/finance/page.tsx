import DoctorManageFinancePage from "@/Components/DoctorPanel/Finance/DoctorManageFinancePage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const DoctorManageFinance = async () => {
  const textContent = await getScopedTextContent(["doctorPanelFinance"]);
  return (
    <LocaleScopeProvider
      namespaces={["doctorPanelFinance"]}
      initialTextContent={textContent}
    >
      <DoctorManageFinancePage />
    </LocaleScopeProvider>
  );
};

export default DoctorManageFinance;
