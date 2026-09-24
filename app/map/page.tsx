import MapPage from "@/Components/Map/MapPage";
import {
  getListPageMetadata,
  getListPageWebSchema,
} from "@/Components/helpers/getPageMetadata";
import JsonLdSchema from "@/Components/UI/JsonLdSchema";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

export const generateMetadata = () => getListPageMetadata("/map");

const NAMESPACES: ContentNamespace[] = ["common", "mapPage", "uiForm"];

const Map = async () => {
  const [webSchema, textContent] = await Promise.all([
    getListPageWebSchema("/map"),
    getScopedTextContent(NAMESPACES),
  ]);
  return (
    <LocaleScopeProvider
      namespaces={NAMESPACES}
      initialTextContent={textContent}
    >
      <JsonLdSchema schema={webSchema} />
      <MapPage />
    </LocaleScopeProvider>
  );
};

export default Map;
