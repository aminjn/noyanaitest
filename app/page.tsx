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

// Reference example for the namespaced text content system: the root layout
// only provides the shared "common" namespace, and this page fetches just the
// namespaces HomePage's tree declares ("home", plus the reusable "homeFaqs" /
// "blogMainCard" blocks; see Components/Enums/contentNamespaces.tsx) and
// layers them on top via LocaleScopeProvider. Components/Home/* read them via
// useScopedLocale().
const Home = async () => {
  const [data, textContent, webSchema] = await Promise.all([
    getPublicData<HomePageProps>("home"),
    getScopedTextContent(["home", "homeFaqs", "blogMainCard"]),
    getListPageWebSchema("/"),
  ]);

  return (
    <>
      <JsonLdSchema schema={webSchema} />
      <LocaleScopeProvider
        namespaces={["home", "homeFaqs", "blogMainCard"]}
        initialTextContent={textContent}
      >
        <HomePage {...data} />
      </LocaleScopeProvider>
    </>
  );
};

export default Home;
