import { getPublicData } from "@/Components/helpers/getPublicData";
import PolicyPage, { PolicyPageProps } from "@/Components/Policy/PolicyPage";
import { notFound } from "next/navigation";
import {
  getListPageMetadata,
  getListPageWebSchema,
} from "@/Components/helpers/getPageMetadata";
import JsonLdSchema from "@/Components/UI/JsonLdSchema";

export const generateMetadata = () => getListPageMetadata("/privacy");

const Privacy = async () => {
  const data = await getPublicData<PolicyPageProps>("privacy");

  if (!data) return notFound();

  const webSchema = await getListPageWebSchema("/privacy");

  return (
    <>
      <JsonLdSchema schema={webSchema} />
      <PolicyPage
        {...data}
        title="privacyPageTitle"
        legend="privacyPageLegend"
        path="/privacy"
      />
    </>
  );
};

export default Privacy;
