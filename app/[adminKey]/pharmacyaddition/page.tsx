import { Suspense } from "react";
import AdminManagePharmacyAdditionsPage from "@/Components/Admin/PharmacyAddition/AdminManagePharmacyAdditionsPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const LOCALE_NS: ContentNamespace[] = ["adminCommon"];

const AdminManagePharmacyAdditions = async () => {
  const textContent = await getScopedTextContent(LOCALE_NS);
  return (
    <LocaleScopeProvider namespaces={LOCALE_NS} initialTextContent={textContent}>
      <Suspense>
        <AdminManagePharmacyAdditionsPage />
      </Suspense>
    </LocaleScopeProvider>
  );
};

export default AdminManagePharmacyAdditions;
