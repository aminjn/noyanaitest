import { Suspense } from "react";
import AdminFinanceTransactionsPage from "@/Components/Admin/Finance/AdminFinanceTransactionsPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const LOCALE_NS: ContentNamespace[] = ["adminCommon"];

const AdminFinanceTransactions = async () => {
  const textContent = await getScopedTextContent(LOCALE_NS);
  return (
    <LocaleScopeProvider namespaces={LOCALE_NS} initialTextContent={textContent}>
      <Suspense>
        <AdminFinanceTransactionsPage />
      </Suspense>
    </LocaleScopeProvider>
  );
};

export default AdminFinanceTransactions;
