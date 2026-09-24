import ContactPage from "@/Components/Contact/ContactPage";
import {
  getListPageMetadata,
  getListPageWebSchema,
} from "@/Components/helpers/getPageMetadata";
import JsonLdSchema from "@/Components/UI/JsonLdSchema";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const NS: ContentNamespace[] = ["contactPage"];

export const generateMetadata = () => getListPageMetadata("/contact");

const Contact = async () => {
  const [textContent, webSchema] = await Promise.all([
    getScopedTextContent(NS),
    getListPageWebSchema("/contact"),
  ]);
  return (
    <>
      <JsonLdSchema schema={webSchema} />
      <LocaleScopeProvider namespaces={NS} initialTextContent={textContent}>
        <ContactPage />
      </LocaleScopeProvider>
    </>
  );
};

export default Contact;
