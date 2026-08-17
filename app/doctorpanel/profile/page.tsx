import DoctorManageProfilePage from "@/Components/DoctorPanel/Profile/DoctorManageProfilePage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const DoctorManageProfile = async () => {
  const textContent = await getScopedTextContent(["common", "doctorPanelProfile"]);
  return (
    <LocaleScopeProvider
      namespaces={["common", "doctorPanelProfile"]}
      initialTextContent={textContent}
    >
      <DoctorManageProfilePage />
    </LocaleScopeProvider>
  );
};

export default DoctorManageProfile;
