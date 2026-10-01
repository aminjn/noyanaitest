import CenterAgendaPage from "@/Components/_Common/CenterAgenda/CenterAgendaPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const NAMESPACES = ["centerDoctors", "doctorPanelSchedule", "dashboardReservationStatusBadge"] as const;

const CenterAgenda = async () => {
  const textContent = await getScopedTextContent([...NAMESPACES]);
  return (
    <LocaleScopeProvider namespaces={[...NAMESPACES]} initialTextContent={textContent}>
      <CenterAgendaPage kind="hospital" panel="hospitalpanel" />
    </LocaleScopeProvider>
  );
};

export default CenterAgenda;
