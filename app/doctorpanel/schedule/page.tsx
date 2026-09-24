import DoctorManageSchedulePage from "@/Components/DoctorPanel/Schedule/DoctorManageSchedulePage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const DoctorManageSchedule = async () => {
  const textContent = await getScopedTextContent(["doctorPanelSchedule", "dashboardReservationStatusBadge"]);
  return (
    <LocaleScopeProvider
      namespaces={["doctorPanelSchedule", "dashboardReservationStatusBadge"]}
      initialTextContent={textContent}
    >
      <DoctorManageSchedulePage />
    </LocaleScopeProvider>
  );
};

export default DoctorManageSchedule;
