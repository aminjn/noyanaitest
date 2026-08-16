import { getPublicData } from "@/Components/helpers/getPublicData";
import PolicyPage, { PolicyPageProps } from "@/Components/Policy/PolicyPage";
import { notFound } from "next/navigation";

const Policy = async () => {
  const data = await getPublicData<PolicyPageProps>(`/policy`);
  if (!data) return notFound();
  return (
    <PolicyPage
      {...data}
      title="policyPageTitle"
      legend="policyPageLegend"
      path="/policy"
    />
  );
};

export default Policy;
