import OrderConfirmationPage from "@/Components/Order/OrderConfirmationPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const NS: ContentNamespace[] = ["common", "orderConfirmation"];

const OrderConfirmation = async () => {
  const textContent = await getScopedTextContent(NS);
  return (
    <LocaleScopeProvider namespaces={NS} initialTextContent={textContent}>
      <OrderConfirmationPage />
    </LocaleScopeProvider>
  );
};

export default OrderConfirmation;
