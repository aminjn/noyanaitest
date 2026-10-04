import { Metadata } from "next";
import ProPage from "@/Components/Pro/ProPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import { ContentKey } from "@/Components/Enums/contentKeys";
import { getServerContent } from "@/Components/i18n/serverContent";

const NS = ["common", "sharedLicense", "pro"] as ContentNamespace[];

export const generateMetadata = async (): Promise<Metadata> => {
  const getContent = await getServerContent();
  return {
    title: getContent("proPageTitle"),
    description: getContent("proPageDescription"),
  };
};

// The patients' «پرو» membership (2026-10): benefits, prices and the way in
// - the public counterpart of /pricing (which is for providers).
const Pro = async () => {
  const textContent = await getScopedTextContent(NS);
  return (
    <LocaleScopeProvider namespaces={NS} initialTextContent={textContent}>
      <ProPage />
    </LocaleScopeProvider>
  );
};

export default Pro;
