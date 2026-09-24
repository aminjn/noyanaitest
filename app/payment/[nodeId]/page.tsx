import PaymentResultPage from "@/Components/Payment/PaymentResultPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const NS: ContentNamespace[] = ["common", "paymentResult"];

const PaymentResult = async () => {
  const textContent = await getScopedTextContent(NS);
  return (
    <LocaleScopeProvider namespaces={NS} initialTextContent={textContent}>
      <PaymentResultPage />
    </LocaleScopeProvider>
  );
};

export default PaymentResult;
