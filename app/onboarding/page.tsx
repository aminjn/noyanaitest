import { getPublicData } from "@/Components/helpers/getPublicData";
import OnboardingPage, {
  OnboardingpageProps,
} from "@/Components/Onboarding/OnboardingPage";
import { notFound } from "next/navigation";

const Onboarding = async () => {
  const data = await getPublicData<OnboardingpageProps>("onboarding");
  if (!data) return notFound();
  return <OnboardingPage {...data} />;
};

export default Onboarding;
