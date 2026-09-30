import { Suspense } from "react";
import AdminFinanceWithdrawalsPage from "@/Components/Admin/Finance/AdminFinanceWithdrawalsPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const LOCALE_NS: ContentNamespace[] = ["adminCommon"];

const AdminFinanceWithdrawals = async () => {
  const textContent = await getScopedTextContent(LOCALE_NS);
  return (
    <LocaleScopeProvider namespaces={LOCALE_NS} initialTextContent={textContent}>
      <Suspense>
        <AdminFinanceWithdrawalsPage />
      </Suspense>
    </LocaleScopeProvider>
  );
};

export default AdminFinanceWithdrawals;
