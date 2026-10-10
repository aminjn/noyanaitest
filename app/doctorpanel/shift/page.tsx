import DoctorManageShiftsPage from "@/Components/DoctorPanel/Shift/DoctorManageShiftsPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const DoctorManageShifts = async () => {
  const textContent = await getScopedTextContent(["doctorPanelShift", "doctorPanelShiftUtils", "dashboardReservationStatusBadge"]);
  return (
    <LocaleScopeProvider
      namespaces={["doctorPanelShift", "doctorPanelShiftUtils", "dashboardReservationStatusBadge"]}
      initialTextContent={textContent}
    >
      <DoctorManageShiftsPage />
    </LocaleScopeProvider>
  );
};

export default DoctorManageShifts;
