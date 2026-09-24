import BecomeHospitalRequestPage from "@/Components/Become/BecomeHospitalRequestPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import {
  getListPageMetadata,
  getListPageWebSchema,
} from "@/Components/helpers/getPageMetadata";
import JsonLdSchema from "@/Components/UI/JsonLdSchema";

export const generateMetadata = () => getListPageMetadata("/become/hospital");

const BecomeHospital = async () => {
  const [textContent, webSchema] = await Promise.all([
    getScopedTextContent(["becomeHospital"]),
    getListPageWebSchema("/become/hospital"),
  ]);
  return (
    <>
      <JsonLdSchema schema={webSchema} />
      <LocaleScopeProvider
        namespaces={["becomeHospital"]}
        initialTextContent={textContent}
      >
        <BecomeHospitalRequestPage />
      </LocaleScopeProvider>
    </>
  );
};

export default BecomeHospital;
