import PharmacyManageFinancePage from "@/Components/PharmacyPanel/Finance/PharmacyManageFinancePage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const PharmacyManageFinance = async () => {
  const textContent = await getScopedTextContent(["pharmacyPanelFinance", "walletWithdrawal"]);
  return (
    <LocaleScopeProvider
      namespaces={["pharmacyPanelFinance", "walletWithdrawal"]}
      initialTextContent={textContent}
    >
      <PharmacyManageFinancePage />
    </LocaleScopeProvider>
  );
};

export default PharmacyManageFinance;
