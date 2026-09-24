import BecomeParaClinicRequestPage from "@/Components/Become/BecomeParaClinicRequestPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import {
  getListPageMetadata,
  getListPageWebSchema,
} from "@/Components/helpers/getPageMetadata";
import JsonLdSchema from "@/Components/UI/JsonLdSchema";

export const generateMetadata = () => getListPageMetadata("/become/paraClinic");

const BecomeParaClinic = async () => {
  const [textContent, webSchema] = await Promise.all([
    getScopedTextContent(["becomeParaClinic"]),
    getListPageWebSchema("/become/paraClinic"),
  ]);
  return (
    <>
      <JsonLdSchema schema={webSchema} />
      <LocaleScopeProvider
        namespaces={["becomeParaClinic"]}
        initialTextContent={textContent}
      >
        <BecomeParaClinicRequestPage />
      </LocaleScopeProvider>
    </>
  );
};

export default BecomeParaClinic;
