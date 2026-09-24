import ParaClinicTestsPage from "@/Components/ParaClinicDashboard/Test/ParaClinicTestsPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const ParaClinicTest = async () => {
  const textContent = await getScopedTextContent(["common", "paraClinicPanelTest"]);
  return (
    <LocaleScopeProvider
      namespaces={["common", "paraClinicPanelTest"]}
      initialTextContent={textContent}
    >
      <ParaClinicTestsPage />
    </LocaleScopeProvider>
  );
};

export default ParaClinicTest;
