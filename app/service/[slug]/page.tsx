import { getPublicData } from "@/Components/helpers/getPublicData";
import ServicePage, {
  ServicePageProps,
} from "@/Components/Service/ServicePage";
import { notFound } from "next/navigation";

const Service = async (ctx: { params: { slug: string } }) => {
  const data = await getPublicData<ServicePageProps>(
    `/service/${ctx.params.slug}`,
  );

  if (!data) return notFound();

  return <ServicePage {...data} />;
};

export default Service;
