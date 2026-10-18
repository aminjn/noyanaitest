import WizardPage from "@/Components/Wizard/WizardPage";
import WizardLanding from "@/Components/Wizard/WizardLanding";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import JsonLdSchema from "@/Components/UI/JsonLdSchema";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import { getListPageMetadata, getListPageWebSchema } from "@/Components/helpers/getPageMetadata";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const NS: ContentNamespace[] = ["wizardPage"];

// /wizard is a search entry (its title, description and structured data
// from «سئوی خودکار»); the chats under it (/wizard/<id>) stay private
export const generateMetadata = () => getListPageMetadata("/wizard");

const Wizard = async () => {
  const [textContent, webSchema] = await Promise.all([
    getScopedTextContent(NS),
    getListPageWebSchema("/wizard"),
  ]);
  return (
    <LocaleScopeProvider namespaces={NS} initialTextContent={textContent}>
      <JsonLdSchema schema={webSchema} />
      <WizardPage landing={<WizardLanding />} />
    </LocaleScopeProvider>
  );
};

export default Wizard;
