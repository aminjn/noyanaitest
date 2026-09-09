import BecomePharmacyRequestPage from "@/Components/Become/BecomePharmacyRequestPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const BecomePharmacy = async () => {
  const textContent = await getScopedTextContent(["becomePharmacy"]);
  return (
    <LocaleScopeProvider
      namespaces={["becomePharmacy"]}
      initialTextContent={textContent}
    >
      <BecomePharmacyRequestPage />
    </LocaleScopeProvider>
  );
};

export default BecomePharmacy;
