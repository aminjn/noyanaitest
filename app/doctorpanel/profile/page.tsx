import DoctorManageProfilePage from "@/Components/DoctorPanel/Profile/DoctorManageProfilePage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const DoctorManageProfile = async () => {
  const textContent = await getScopedTextContent(["doctorPanelProfile"]);
  return (
    <LocaleScopeProvider
      namespaces={["doctorPanelProfile"]}
      initialTextContent={textContent}
    >
      <DoctorManageProfilePage />
    </LocaleScopeProvider>
  );
};

export default DoctorManageProfile;
