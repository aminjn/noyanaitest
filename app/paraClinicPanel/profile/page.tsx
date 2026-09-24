import ParaClinicManageProfilePage from "@/Components/ParaClinicDashboard/Profile/ParaClinicManageProfilePage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const ParaClinicProfile = async () => {
  const textContent = await getScopedTextContent(["paraClinicPanelProfile"]);
  return (
    <LocaleScopeProvider
      namespaces={["paraClinicPanelProfile"]}
      initialTextContent={textContent}
    >
      <ParaClinicManageProfilePage />
    </LocaleScopeProvider>
  );
};

export default ParaClinicProfile;
