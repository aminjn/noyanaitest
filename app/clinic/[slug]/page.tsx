import ClinicPage, { ClinicPageProps } from "@/Components/Clinic/ClinicPage";
import { getPublicData } from "@/Components/helpers/getPublicData";
import { notFound } from "next/navigation";

const Clinic = async (ctx: { params: { slug: string } }) => {
  const data = await getPublicData<ClinicPageProps>(
    `clinic/${ctx.params.slug}`,
  );
  if (!data) return notFound();
  return <ClinicPage {...data} />;
};

export default Clinic;
