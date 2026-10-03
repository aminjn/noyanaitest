import { Metadata } from "next";
import OptOutPage from "@/Components/OptOut/OptOutPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const NS: ContentNamespace[] = ["common", "bizCrm"];

// a personal link: never indexed
export const metadata: Metadata = { robots: { index: false, follow: false } };

const OptOut = async ({ params }: { params: { code: string } }) => {
  const textContent = await getScopedTextContent(NS);
  return (
    <LocaleScopeProvider namespaces={NS} initialTextContent={textContent}>
      <OptOutPage code={params.code} />
    </LocaleScopeProvider>
  );
};

export default OptOut;
