import { getPublicData } from "@/Components/helpers/getPublicData";
import InsurancePage, {
  InsurancePageProps,
} from "@/Components/Insurance/InsurancePage";
import { notFound } from "next/navigation";

const Insurance = async (ctx: { params: { slug: string } }) => {
  const data = await getPublicData<InsurancePageProps>(
    `/insurance/${ctx.params.slug}`,
  );
  if (!data) return notFound();
  return <InsurancePage {...data} />;
};

export default Insurance;
