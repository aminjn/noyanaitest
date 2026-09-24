import ClinicTaminCbPage from "@/Components/ClinicPanel/Tamin/ClinicTaminCbPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const ClinicTaminCb = async () => {
  const textContent = await getScopedTextContent(["clinicPanelTamin"]);
  return (
    <LocaleScopeProvider
      namespaces={["clinicPanelTamin"]}
      initialTextContent={textContent}
    >
      <ClinicTaminCbPage />
    </LocaleScopeProvider>
  );
};

export default ClinicTaminCb;
