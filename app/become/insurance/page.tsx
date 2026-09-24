import BecomeInsuranceRequestPage from "@/Components/Become/BecomeInsuranceRequestPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import {
  getListPageMetadata,
  getListPageWebSchema,
} from "@/Components/helpers/getPageMetadata";
import JsonLdSchema from "@/Components/UI/JsonLdSchema";

export const generateMetadata = () => getListPageMetadata("/become/insurance");

const BecomeInsurance = async () => {
  const [textContent, webSchema] = await Promise.all([
    getScopedTextContent(["becomeInsurance"]),
    getListPageWebSchema("/become/insurance"),
  ]);
  return (
    <>
      <JsonLdSchema schema={webSchema} />
      <LocaleScopeProvider
        namespaces={["becomeInsurance"]}
        initialTextContent={textContent}
      >
        <BecomeInsuranceRequestPage />
      </LocaleScopeProvider>
    </>
  );
};

export default BecomeInsurance;
