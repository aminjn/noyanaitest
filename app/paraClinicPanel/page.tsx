import ParaClinicDashboardHomePage from "@/Components/ParaClinicDashboard/ParaClinicDashboardHomePage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const ParaClinicDashboardHome = async () => {
  const textContent = await getScopedTextContent(["paraClinicPanelHome", "providerHome", "walletWithdrawal"]);
  return (
    <LocaleScopeProvider
      namespaces={["paraClinicPanelHome", "providerHome", "walletWithdrawal"]}
      initialTextContent={textContent}
    >
      <ParaClinicDashboardHomePage />
    </LocaleScopeProvider>
  );
};

export default ParaClinicDashboardHome;
