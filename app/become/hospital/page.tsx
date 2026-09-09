import BecomeHospitalRequestPage from "@/Components/Become/BecomeHospitalRequestPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const BecomeHospital = async () => {
  const textContent = await getScopedTextContent(["becomeHospital"]);
  return (
    <LocaleScopeProvider
      namespaces={["becomeHospital"]}
      initialTextContent={textContent}
    >
      <BecomeHospitalRequestPage />
    </LocaleScopeProvider>
  );
};

export default BecomeHospital;
