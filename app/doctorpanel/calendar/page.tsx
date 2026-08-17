import DoctorManageCalendarPage from "@/Components/DoctorPanel/Calendar/DoctorManageCalendarPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const DoctorManageCalendar = async () => {
  const textContent = await getScopedTextContent(["common", "doctorPanelCalendar"]);
  return (
    <LocaleScopeProvider
      namespaces={["common", "doctorPanelCalendar"]}
      initialTextContent={textContent}
    >
      <DoctorManageCalendarPage />
    </LocaleScopeProvider>
  );
};

export default DoctorManageCalendar;
