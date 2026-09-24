import DashboardManageVitalsPage from "@/Components/Dashboard/Vital/DashboardManageVitalsPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const NS: ContentNamespace[] = [
  "common",
  "dashboardVital",
  "dashboardVitalList",
  "dashboardAddVitalPopup",
];

const DashboardManageVitals = async () => {
  const textContent = await getScopedTextContent(NS);
  return (
    <LocaleScopeProvider
      namespaces={NS}
      initialTextContent={textContent}
    >
      <DashboardManageVitalsPage />
    </LocaleScopeProvider>
  );
};

export default DashboardManageVitals;
