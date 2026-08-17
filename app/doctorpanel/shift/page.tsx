import DoctorManageShiftsPage from "@/Components/DoctorPanel/Shift/DoctorManageShiftsPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const DoctorManageShifts = async () => {
  const textContent = await getScopedTextContent(["common", "doctorPanelShift"]);
  return (
    <LocaleScopeProvider
      namespaces={["common", "doctorPanelShift"]}
      initialTextContent={textContent}
    >
      <DoctorManageShiftsPage />
    </LocaleScopeProvider>
  );
};

export default DoctorManageShifts;
