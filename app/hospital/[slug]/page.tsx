import { getPublicData } from "@/Components/helpers/getPublicData";
import HospitalPage, {
  HospitalPageProps,
} from "@/Components/Hospital/HospitalPage";
import { notFound } from "next/navigation";

const Hospital = async (ctx: { params: { slug: string } }) => {
  const data = await getPublicData<HospitalPageProps>(
    `/hospital/${ctx.params.slug}`,
  );
  if (!data) return notFound();
  return <HospitalPage {...data} />;
};

export default Hospital;
