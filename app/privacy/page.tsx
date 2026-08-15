import { getPublicData } from "@/Components/helpers/getPublicData";
import PolicyPage, { PolicyPageProps } from "@/Components/Policy/PolicyPage";
import { notFound } from "next/navigation";

const Privacy = async () => {
  const data = await getPublicData<PolicyPageProps>("privacy");

  if (!data) return notFound();

  return (
    <PolicyPage {...data} title="privacyPageTitle" legend="privacyPageLegend" />
  );
};

export default Privacy;
