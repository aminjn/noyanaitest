import ParaClinicManageProfilePage from "@/Components/ParaClinicDashboard/Profile/ParaClinicManageProfilePage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const ParaClinicProfile = async () => {
  const textContent = await getScopedTextContent(["common", "paraClinicPanelProfile"]);
  return (
    <LocaleScopeProvider
      namespaces={["common", "paraClinicPanelProfile"]}
      initialTextContent={textContent}
    >
      <ParaClinicManageProfilePage />
    </LocaleScopeProvider>
  );
};

export default ParaClinicProfile;
