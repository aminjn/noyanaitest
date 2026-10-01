import InsurerNetworkPage from "@/Components/InsurancePanel/Network/InsurerNetworkPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const Page = async () => {
  const textContent = await getScopedTextContent(["insurerPanel"]);
  return (
    <LocaleScopeProvider namespaces={["insurerPanel"]} initialTextContent={textContent}>
      <InsurerNetworkPage />
    </LocaleScopeProvider>
  );
};

export default Page;
