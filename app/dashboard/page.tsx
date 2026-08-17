import DashboardPage from "@/Components/Dashboard/DashboardPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

// Unlike the public list pages, this route did no server-side data fetching
// at all before (DashboardPage is "use client" and pulls everything via
// useSWR after auth). Adding the scoped text content fetch here is the only
// change — DashboardPage and everything it renders keep calling useLocale()
// unchanged, same non-breaking merge-on-top pattern as every other page.
const Dashboard = async () => {
  const textContent = await getScopedTextContent(["common", "dashboardHome"]);
  return (
    <LocaleScopeProvider
      namespaces={["common", "dashboardHome"]}
      initialTextContent={textContent}
    >
      <DashboardPage />
    </LocaleScopeProvider>
  );
};

export default Dashboard;
