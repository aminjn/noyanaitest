import { Metadata } from "next";
import ProviderPricingPage from "@/Components/Pricing/ProviderPricingPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import { ContentKey } from "@/Components/Enums/contentKeys";
import { getServerContent } from "@/Components/i18n/serverContent";

const NS: ContentNamespace[] = ["common", "sharedLicense", "becomeSomething"];

export const generateMetadata = async (): Promise<Metadata> => {
  const getContent = await getServerContent();
  return {
    title: getContent("pricingPageTitle" as ContentKey),
    description: getContent("pricingPageDescription" as ContentKey),
  };
};

// Public plans and prices for providers (2026-10): every provider kind's
// plan lineup with the running launch discount - what Doctolib Pro,
// Doctoralia and Practo Ray publish as their "tarifs / pricing" page.
const Pricing = async () => {
  const textContent = await getScopedTextContent(NS);
  return (
    <LocaleScopeProvider namespaces={NS} initialTextContent={textContent}>
      <ProviderPricingPage />
    </LocaleScopeProvider>
  );
};

export default Pricing;
