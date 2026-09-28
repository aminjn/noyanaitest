import AdminHubPage from "@/Components/Admin/Hub/AdminHubPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const LOCALE_NS: ContentNamespace[] = ["adminCommon"];

const AdminDevTools = async () => {
  const textContent = await getScopedTextContent(LOCALE_NS);
  return (
    <LocaleScopeProvider namespaces={LOCALE_NS} initialTextContent={textContent}>
      <AdminHubPage
        hub="devtools"
        intro="تست اتصال سرویس‌های بیرونی و دسترسی به دیتابیس قدیم. فقط برای توسعه و عیب‌یابی."
      />
    </LocaleScopeProvider>
  );
};

export default AdminDevTools;
