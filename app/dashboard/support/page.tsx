import SupportPage from "@/Components/Dashboard/Support/SupportPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const Support = async () => {
  const textContent = await getScopedTextContent(["dashboardSupport"]);
  return (
    <LocaleScopeProvider
      namespaces={["dashboardSupport"]}
      initialTextContent={textContent}
    >
      <SupportPage />
    </LocaleScopeProvider>
  );
};

export default Support;
