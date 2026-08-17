import DashboardManageVitalsPage from "@/Components/Dashboard/Vital/DashboardManageVitalsPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const DashboardManageVitals = async () => {
  const textContent = await getScopedTextContent(["common", "dashboardVital"]);
  return (
    <LocaleScopeProvider
      namespaces={["common", "dashboardVital"]}
      initialTextContent={textContent}
    >
      <DashboardManageVitalsPage />
    </LocaleScopeProvider>
  );
};

export default DashboardManageVitals;
