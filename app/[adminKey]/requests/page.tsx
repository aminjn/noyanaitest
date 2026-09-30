import { Suspense } from "react";
import AdminRequestsPage from "@/Components/Admin/Requests/AdminRequestsPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const LOCALE_NS: ContentNamespace[] = ["adminCommon"];

const AdminRequests = async () => {
  const textContent = await getScopedTextContent(LOCALE_NS);
  return (
    <LocaleScopeProvider namespaces={LOCALE_NS} initialTextContent={textContent}>
      <Suspense>
        <AdminRequestsPage />
      </Suspense>
    </LocaleScopeProvider>
  );
};

export default AdminRequests;
