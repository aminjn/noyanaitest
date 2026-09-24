import NotFoundPage from "@/Components/NotFound/NotFoundPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const NAMESPACES: ContentNamespace[] = ["common", "notFound"];

export default async function NotFound() {
  const textContent = await getScopedTextContent(NAMESPACES);
  return (
    <LocaleScopeProvider
      namespaces={NAMESPACES}
      initialTextContent={textContent}
    >
      <NotFoundPage />
    </LocaleScopeProvider>
  );
}
