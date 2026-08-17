import DoctorManageCalendarDayPage from "@/Components/DoctorPanel/Calendar/DoctorManageCalendarDayPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const DoctorManageCalendarDay = async () => {
  const textContent = await getScopedTextContent(["common", "doctorPanelCalendar"]);
  return (
    <LocaleScopeProvider
      namespaces={["common", "doctorPanelCalendar"]}
      initialTextContent={textContent}
    >
      <DoctorManageCalendarDayPage />
    </LocaleScopeProvider>
  );
};

export default DoctorManageCalendarDay;
