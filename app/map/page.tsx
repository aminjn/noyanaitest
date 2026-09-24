import MapPage from "@/Components/Map/MapPage";
import {
  getListPageMetadata,
  getListPageWebSchema,
} from "@/Components/helpers/getPageMetadata";
import JsonLdSchema from "@/Components/UI/JsonLdSchema";

export const generateMetadata = () => getListPageMetadata("/map");

const Map = async () => {
  const webSchema = await getListPageWebSchema("/map");
  return (
    <>
      <JsonLdSchema schema={webSchema} />
      <MapPage />
    </>
  );
};

export default Map;
