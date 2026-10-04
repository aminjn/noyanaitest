import { Suspense } from "react";
import AdminManageTicketsPage from "@/Components/Admin/Support/AdminManageTicketsPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const LOCALE_NS: ContentNamespace[] = ["adminCommon"];

const AdminManageTickets = async () => {
  const textContent = await getScopedTextContent(LOCALE_NS);
  return (
    <LocaleScopeProvider namespaces={LOCALE_NS} initialTextContent={textContent}>
      {/* the list reads ?user= (useSearchParams) */}
      <Suspense>
        <AdminManageTicketsPage />
      </Suspense>
    </LocaleScopeProvider>
  );
};

export default AdminManageTickets;
