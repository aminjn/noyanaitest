import InsurerPlansPage from "@/Components/InsurancePanel/Plan/InsurerPlansPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const Page = async () => {
  const textContent = await getScopedTextContent(["insurerPanel"]);
  return (
    <LocaleScopeProvider namespaces={["insurerPanel"]} initialTextContent={textContent}>
      <InsurerPlansPage />
    </LocaleScopeProvider>
  );
};

export default Page;
