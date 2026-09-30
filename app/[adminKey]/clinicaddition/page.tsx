import { Suspense } from "react";
import AdminManageClinicAdditionsPage from "@/Components/Admin/ClinicAddition/AdminManageClinicAdditionsPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const LOCALE_NS: ContentNamespace[] = ["adminCommon"];

const AdminManageClinicAdditions = async () => {
  const textContent = await getScopedTextContent(LOCALE_NS);
  return (
    <LocaleScopeProvider namespaces={LOCALE_NS} initialTextContent={textContent}>
      <Suspense>
        <AdminManageClinicAdditionsPage />
      </Suspense>
    </LocaleScopeProvider>
  );
};

export default AdminManageClinicAdditions;
