import BecomeClinicRequestPage from "@/Components/Become/BecomeClinicRequestPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import {
  getListPageMetadata,
  getListPageWebSchema,
} from "@/Components/helpers/getPageMetadata";
import JsonLdSchema from "@/Components/UI/JsonLdSchema";

export const generateMetadata = () => getListPageMetadata("/become/clinic");

const BecomeClinic = async () => {
  const [textContent, webSchema] = await Promise.all([
    getScopedTextContent(["becomeClinic"]),
    getListPageWebSchema("/become/clinic"),
  ]);
  return (
    <>
      <JsonLdSchema schema={webSchema} />
      <LocaleScopeProvider
        namespaces={["becomeClinic"]}
        initialTextContent={textContent}
      >
        <BecomeClinicRequestPage />
      </LocaleScopeProvider>
    </>
  );
};

export default BecomeClinic;
