import DoctorManageFinancePage from "@/Components/DoctorPanel/Finance/DoctorManageFinancePage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const DoctorManageFinance = async () => {
  const textContent = await getScopedTextContent(["doctorPanelFinance", "walletWithdrawal"]);
  return (
    <LocaleScopeProvider
      namespaces={["doctorPanelFinance", "walletWithdrawal"]}
      initialTextContent={textContent}
    >
      <DoctorManageFinancePage />
    </LocaleScopeProvider>
  );
};

export default DoctorManageFinance;
