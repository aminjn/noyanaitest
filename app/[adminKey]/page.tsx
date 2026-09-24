import AdminPage from "@/Components/Admin/AdminPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const LOCALE_NS: ContentNamespace[] = ["common", "adminCommon"];

export type AdminProps<T = Record<string, never>> = {
  params: { adminKey: string } & T;
};

// adminKey enforcement now lives in app/[adminKey]/layout.tsx, applied to
// every admin page uniformly — see F-05 in AUDIT/FIXES_TODO.md.
const Admin = async () => {
  const textContent = await getScopedTextContent(LOCALE_NS);
  return (
    <LocaleScopeProvider namespaces={LOCALE_NS} initialTextContent={textContent}>
      <AdminPage />
    </LocaleScopeProvider>
  );
};

export default Admin;
