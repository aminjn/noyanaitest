import PharmacyManageProfilePage from "@/Components/PharmacyPanel/Profile/PharmacyManageProfilePage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const PharmacyProfile = async () => {
  const textContent = await getScopedTextContent(["pharmacyPanelProfile"]);
  return (
    <LocaleScopeProvider
      namespaces={["pharmacyPanelProfile"]}
      initialTextContent={textContent}
    >
      <PharmacyManageProfilePage />
    </LocaleScopeProvider>
  );
};

export default PharmacyProfile;
