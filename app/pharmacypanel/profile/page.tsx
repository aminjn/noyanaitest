import PharmacyManageProfilePage from "@/Components/PharmacyPanel/Profile/PharmacyManageProfilePage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const PharmacyProfile = async () => {
  const textContent = await getScopedTextContent(["common", "pharmacyPanelProfile"]);
  return (
    <LocaleScopeProvider
      namespaces={["common", "pharmacyPanelProfile"]}
      initialTextContent={textContent}
    >
      <PharmacyManageProfilePage />
    </LocaleScopeProvider>
  );
};

export default PharmacyProfile;
