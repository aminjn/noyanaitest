import ParaClinicTaminPage from "@/Components/ParaClinicDashboard/Tamin/ParaClinicTaminPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const ParaClinicTamin = async () => {
  const textContent = await getScopedTextContent(["paraClinicPanelTamin"]);
  return (
    <LocaleScopeProvider
      namespaces={["paraClinicPanelTamin"]}
      initialTextContent={textContent}
    >
      <ParaClinicTaminPage />
    </LocaleScopeProvider>
  );
};

export default ParaClinicTamin;
