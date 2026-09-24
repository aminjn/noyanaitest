import DoctorManageSettingsPage from "@/Components/DoctorPanel/Settings/DoctorManageSettingsPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const DoctorManageSettings = async () => {
  const textContent = await getScopedTextContent(["doctorPanelSettings"]);
  return (
    <LocaleScopeProvider
      namespaces={["doctorPanelSettings"]}
      initialTextContent={textContent}
    >
      <DoctorManageSettingsPage />
    </LocaleScopeProvider>
  );
};

export default DoctorManageSettings;
