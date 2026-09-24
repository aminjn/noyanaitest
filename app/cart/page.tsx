import CartPage from "@/Components/Cart/CartPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const NS: ContentNamespace[] = ["common", "cartPage", "cartCheckoutPopup", "dashboardMutateAddressPopup"];

const Cart = async () => {
  const textContent = await getScopedTextContent(NS);
  return (
    <LocaleScopeProvider namespaces={NS} initialTextContent={textContent}>
      <CartPage />
    </LocaleScopeProvider>
  );
};

export default Cart;
