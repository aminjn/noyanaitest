import DoctorManageCalendarPage from "@/Components/DoctorPanel/Calendar/DoctorManageCalendarPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const DoctorManageCalendar = async () => {
  const textContent = await getScopedTextContent(["common", "doctorPanelCalendar", "uiCalendar"]);
  return (
    <LocaleScopeProvider
      namespaces={["common", "doctorPanelCalendar", "uiCalendar"]}
      initialTextContent={textContent}
    >
      <DoctorManageCalendarPage />
    </LocaleScopeProvider>
  );
};

export default DoctorManageCalendar;
