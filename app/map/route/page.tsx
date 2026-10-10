import { Suspense } from "react";
import RoutePage from "@/Components/Map/RoutePage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const NAMESPACES: ContentNamespace[] = ["mapPage", "uiForm"];

// the way to a place on NexaMap (Components/helpers/navigationUrl.ts)
export const metadata = { robots: { index: false } };

const Route = async () => {
  const textContent = await getScopedTextContent(NAMESPACES);
  return (
    <LocaleScopeProvider namespaces={NAMESPACES} initialTextContent={textContent}>
      {/* the page reads ?to= on the client */}
      <Suspense fallback={null}>
        <RoutePage />
      </Suspense>
    </LocaleScopeProvider>
  );
};

export default Route;
