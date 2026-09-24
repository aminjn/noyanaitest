import DashboardPage from "@/Components/Dashboard/DashboardPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const NS: ContentNamespace[] = [
  "dashboardHome",
  "dashboardUserIdentity",
  "dashboardEditUserDetailsPopup",
  "dashboardUserVitals",
  "dashboardUserMedicalDetails",
  "dashboardMutateUserMedicalPopup",
];

// DashboardPage is "use client" and pulls its data via useSWR after auth;
// this route only prefetches text content server-side. NS covers the page's
// own namespace plus the per-component namespaces its children
// (UserIdentity, UserVitals, UserMedicalDetails and their popups) declare
// via useScopedLocale.
const Dashboard = async () => {
  const textContent = await getScopedTextContent(NS);
  return (
    <LocaleScopeProvider
      namespaces={NS}
      initialTextContent={textContent}
    >
      <DashboardPage />
    </LocaleScopeProvider>
  );
};

export default Dashboard;
