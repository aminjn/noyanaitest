import { getPublicData } from "@/Components/helpers/getPublicData";
import OnboardingPage, {
  OnboardingpageProps,
} from "@/Components/Onboarding/OnboardingPage";
import { notFound } from "next/navigation";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const NS: ContentNamespace[] = ["onboardingPage"];

const Onboarding = async () => {
  const [data, textContent] = await Promise.all([
    getPublicData<OnboardingpageProps>("onboarding"),
    getScopedTextContent(NS),
  ]);
  if (!data) return notFound();
  return (
    <LocaleScopeProvider namespaces={NS} initialTextContent={textContent}>
      <OnboardingPage {...data} />
    </LocaleScopeProvider>
  );
};

export default Onboarding;
