import TaminCbPage from "@/Components/DoctorPanel/Tamin/TaminCbPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const TaminCb = async () => {
  const textContent = await getScopedTextContent(["common", "doctorPanelTamin"]);
  return (
    <LocaleScopeProvider
      namespaces={["common", "doctorPanelTamin"]}
      initialTextContent={textContent}
    >
      <TaminCbPage />
    </LocaleScopeProvider>
  );
};

export default TaminCb;
