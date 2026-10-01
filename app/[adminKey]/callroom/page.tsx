import { Suspense } from "react";
import AdminManageCallRoomsPage from "@/Components/Admin/CallRoom/AdminManageCallRoomsPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const LOCALE_NS: ContentNamespace[] = ["adminCommon"];

const AdminManageCallRooms = async () => {
  const textContent = await getScopedTextContent(LOCALE_NS);
  return (
    <LocaleScopeProvider namespaces={LOCALE_NS} initialTextContent={textContent}>
      <Suspense>
        <AdminManageCallRoomsPage />
      </Suspense>
    </LocaleScopeProvider>
  );
};

export default AdminManageCallRooms;
