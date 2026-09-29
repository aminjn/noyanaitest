import { Suspense } from "react";
import AdminFinancePaymentsPage from "@/Components/Admin/Finance/AdminFinancePaymentsPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const LOCALE_NS: ContentNamespace[] = ["adminCommon"];

const AdminFinancePayments = async () => {
  const textContent = await getScopedTextContent(LOCALE_NS);
  return (
    <LocaleScopeProvider namespaces={LOCALE_NS} initialTextContent={textContent}>
      <Suspense>
        <AdminFinancePaymentsPage />
      </Suspense>
    </LocaleScopeProvider>
  );
};

export default AdminFinancePayments;
