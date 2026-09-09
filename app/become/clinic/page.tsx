import BecomeClinicRequestPage from "@/Components/Become/BecomeClinicRequestPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const BecomeClinic = async () => {
  const textContent = await getScopedTextContent(["becomeClinic"]);
  return (
    <LocaleScopeProvider
      namespaces={["becomeClinic"]}
      initialTextContent={textContent}
    >
      <BecomeClinicRequestPage />
    </LocaleScopeProvider>
  );
};

export default BecomeClinic;
