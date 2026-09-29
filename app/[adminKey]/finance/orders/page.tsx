import { Suspense } from "react";
import AdminFinanceOrdersPage from "@/Components/Admin/Finance/AdminFinanceOrdersPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const LOCALE_NS: ContentNamespace[] = ["adminCommon"];

const AdminFinanceOrders = async () => {
  const textContent = await getScopedTextContent(LOCALE_NS);
  return (
    <LocaleScopeProvider namespaces={LOCALE_NS} initialTextContent={textContent}>
      <Suspense>
        <AdminFinanceOrdersPage />
      </Suspense>
    </LocaleScopeProvider>
  );
};

export default AdminFinanceOrders;
