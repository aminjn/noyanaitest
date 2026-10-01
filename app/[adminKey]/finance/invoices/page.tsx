import { Suspense } from "react";
import AdminFinanceInvoicesPage from "@/Components/Admin/Finance/AdminFinanceInvoicesPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const LOCALE_NS: ContentNamespace[] = ["adminCommon"];

const AdminFinanceInvoices = async () => {
  const textContent = await getScopedTextContent(LOCALE_NS);
  return (
    <LocaleScopeProvider namespaces={LOCALE_NS} initialTextContent={textContent}>
      <Suspense>
        <AdminFinanceInvoicesPage />
      </Suspense>
    </LocaleScopeProvider>
  );
};

export default AdminFinanceInvoices;
