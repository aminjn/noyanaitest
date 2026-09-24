import BecomePharmacyRequestPage from "@/Components/Become/BecomePharmacyRequestPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import {
  getListPageMetadata,
  getListPageWebSchema,
} from "@/Components/helpers/getPageMetadata";
import JsonLdSchema from "@/Components/UI/JsonLdSchema";

export const generateMetadata = () => getListPageMetadata("/become/pharmacy");

const BecomePharmacy = async () => {
  const [textContent, webSchema] = await Promise.all([
    getScopedTextContent(["becomePharmacy"]),
    getListPageWebSchema("/become/pharmacy"),
  ]);
  return (
    <>
      <JsonLdSchema schema={webSchema} />
      <LocaleScopeProvider
        namespaces={["becomePharmacy"]}
        initialTextContent={textContent}
      >
        <BecomePharmacyRequestPage />
      </LocaleScopeProvider>
    </>
  );
};

export default BecomePharmacy;
