import OrgFinancePage from "@/Components/_Common/Finance/OrgFinancePage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const Finance = async () => {
  const textContent = await getScopedTextContent(["pharmacyPanelFinance", "walletWithdrawal"]);
  return (
    <LocaleScopeProvider namespaces={["pharmacyPanelFinance", "walletWithdrawal"]} initialTextContent={textContent}>
      <OrgFinancePage
        panel="/hospitalpanel"
        api="/hospital/finance"
        withdrawalApi="/hospital/withdrawal"
        noteKey="ofCenterNote"
      />
    </LocaleScopeProvider>
  );
};

export default Finance;
