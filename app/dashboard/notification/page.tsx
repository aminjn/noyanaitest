import DashboardNotificationsPage from "@/Components/Dashboard/Notification/DashboardNotificationsPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const DashboardNotifications = async () => {
  const textContent = await getScopedTextContent([
    "common",
    "dashboardNotification",
    "notificationPushToggle",
  ]);
  return (
    <LocaleScopeProvider
      namespaces={["common", "dashboardNotification", "notificationPushToggle"]}
      initialTextContent={textContent}
    >
      <DashboardNotificationsPage />
    </LocaleScopeProvider>
  );
};

export default DashboardNotifications;
