import WizardPage from "@/Components/Wizard/WizardPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const NS: ContentNamespace[] = ["wizardPage"];

// a visitor's own chat: never in search
export const metadata = { robots: { index: false, follow: false } };

const Wizard = async () => {
  const textContent = await getScopedTextContent(NS);
  return (
    <LocaleScopeProvider namespaces={NS} initialTextContent={textContent}>
      <WizardPage />
    </LocaleScopeProvider>
  );
};

export default Wizard;
