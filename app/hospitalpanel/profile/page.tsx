import HospitalManageProfilePage from "@/Components/HospitalPanel/Profile/HospitalManageProfilePage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const HospitalProfile = async () => {
  const textContent = await getScopedTextContent(["hospitalPanelProfile"]);
  return (
    <LocaleScopeProvider
      namespaces={["hospitalPanelProfile"]}
      initialTextContent={textContent}
    >
      <HospitalManageProfilePage />
    </LocaleScopeProvider>
  );
};

export default HospitalProfile;
