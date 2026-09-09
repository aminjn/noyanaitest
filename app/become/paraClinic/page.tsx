import BecomeParaClinicRequestPage from "@/Components/Become/BecomeParaClinicRequestPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const BecomeParaClinic = async () => {
  const textContent = await getScopedTextContent(["becomeParaClinic"]);
  return (
    <LocaleScopeProvider
      namespaces={["becomeParaClinic"]}
      initialTextContent={textContent}
    >
      <BecomeParaClinicRequestPage />
    </LocaleScopeProvider>
  );
};

export default BecomeParaClinic;
