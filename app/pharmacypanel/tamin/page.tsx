import PharmacyTaminPage from "@/Components/PharmacyPanel/Tamin/PharmacyTaminPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const PharmacyTamin = async () => {
  const textContent = await getScopedTextContent(["common", "pharmacyPanelTamin"]);
  return (
    <LocaleScopeProvider
      namespaces={["common", "pharmacyPanelTamin"]}
      initialTextContent={textContent}
    >
      <PharmacyTaminPage />
    </LocaleScopeProvider>
  );
};

export default PharmacyTamin;
