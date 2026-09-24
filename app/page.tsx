import { getPublicData } from "@/Components/helpers/getPublicData";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import HomePage, { HomePageProps } from "@/Components/Home/HomePage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import {
  getListPageMetadata,
  getListPageWebSchema,
} from "@/Components/helpers/getPageMetadata";
import JsonLdSchema from "@/Components/UI/JsonLdSchema";

export const generateMetadata = () => getListPageMetadata("/");

// This page is the reference example for the namespaced text content
// system: instead of relying only on the root layout's full textContent
// fetch (still there, unchanged, and still what every other page uses),
// it additionally fetches just the namespaces HomePage's tree declares
// ("common" + "home", plus the reusable "homeFaqs" / "blogMainCard" blocks;
// see Components/Enums/contentNamespaces.tsx) and layers them on top via
// LocaleScopeProvider. Components/Home/* read them via useScopedLocale().
const Home = async () => {
  const [data, textContent, webSchema] = await Promise.all([
    getPublicData<HomePageProps>("home"),
    getScopedTextContent(["common", "home", "homeFaqs", "blogMainCard"]),
    getListPageWebSchema("/"),
  ]);

  return (
    <>
      <JsonLdSchema schema={webSchema} />
      <LocaleScopeProvider
        namespaces={["common", "home", "homeFaqs", "blogMainCard"]}
        initialTextContent={textContent}
      >
        <HomePage {...data} />
      </LocaleScopeProvider>
    </>
  );
};

export default Home;
