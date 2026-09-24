import ParaClinicTestsPage from "@/Components/ParaClinicDashboard/Test/ParaClinicTestsPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const ParaClinicTest = async () => {
  const textContent = await getScopedTextContent(["paraClinicPanelTest"]);
  return (
    <LocaleScopeProvider
      namespaces={["paraClinicPanelTest"]}
      initialTextContent={textContent}
    >
      <ParaClinicTestsPage />
    </LocaleScopeProvider>
  );
};

export default ParaClinicTest;
