import DoctorNetworkPage from "@/Components/DoctorPanel/Network/DoctorNetworkPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const DoctorNetwork = async () => {
  const textContent = await getScopedTextContent(["doctorPanelNetwork"]);
  return (
    <LocaleScopeProvider namespaces={["doctorPanelNetwork"]} initialTextContent={textContent}>
      <DoctorNetworkPage />
    </LocaleScopeProvider>
  );
};

export default DoctorNetwork;
