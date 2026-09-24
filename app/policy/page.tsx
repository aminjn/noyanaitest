import { getPublicData } from "@/Components/helpers/getPublicData";
import PolicyPage, { PolicyPageProps } from "@/Components/Policy/PolicyPage";
import { notFound } from "next/navigation";
import {
  getListPageMetadata,
  getListPageWebSchema,
} from "@/Components/helpers/getPageMetadata";
import JsonLdSchema from "@/Components/UI/JsonLdSchema";

export const generateMetadata = () => getListPageMetadata("/policy");

const Policy = async () => {
  const data = await getPublicData<PolicyPageProps>(`/policy`);
  if (!data) return notFound();
  const webSchema = await getListPageWebSchema("/policy");
  return (
    <>
      <JsonLdSchema schema={webSchema} />
      <PolicyPage
        {...data}
        title="policyPageTitle"
        legend="policyPageLegend"
        path="/policy"
      />
    </>
  );
};

export default Policy;
