import InsuranceManageProfilePage from "@/Components/InsurancePanel/Profile/InsuranceManageProfilePage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const InsuranceProfile = async () => {
  const textContent = await getScopedTextContent(["insurancePanelProfile"]);
  return (
    <LocaleScopeProvider
      namespaces={["insurancePanelProfile"]}
      initialTextContent={textContent}
    >
      <InsuranceManageProfilePage />
    </LocaleScopeProvider>
  );
};

export default InsuranceProfile;
