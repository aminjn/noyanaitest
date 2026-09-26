import { Suspense } from "react";
import AdminAuditLogPage from "@/Components/Admin/Audit/AdminAuditLogPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const LOCALE_NS: ContentNamespace[] = ["adminCommon"];

const AdminAuditLog = async () => {
  const textContent = await getScopedTextContent(LOCALE_NS);
  return (
    <LocaleScopeProvider namespaces={LOCALE_NS} initialTextContent={textContent}>
      <Suspense>
        <AdminAuditLogPage />
      </Suspense>
    </LocaleScopeProvider>
  );
};

export default AdminAuditLog;
