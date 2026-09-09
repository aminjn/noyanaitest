import BecomeInsuranceRequestPage from "@/Components/Become/BecomeInsuranceRequestPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const BecomeInsurance = async () => {
  const textContent = await getScopedTextContent(["becomeInsurance"]);
  return (
    <LocaleScopeProvider
      namespaces={["becomeInsurance"]}
      initialTextContent={textContent}
    >
      <BecomeInsuranceRequestPage />
    </LocaleScopeProvider>
  );
};

export default BecomeInsurance;
