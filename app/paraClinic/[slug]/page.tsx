import { getPublicData } from "@/Components/helpers/getPublicData";
import ParaClinicPage, {
  ParaClinicPageProps,
} from "@/Components/ParaClinic/ParaClinicPage";
import { notFound } from "next/navigation";

const ParaClinic = async (ctx: { params: { slug: string } }) => {
  const data = await getPublicData<ParaClinicPageProps>(
    `/paraClinic/${ctx.params.slug}`,
  );
  if (!data) return notFound();
  return <ParaClinicPage {...data} />;
};

export default ParaClinic;
