import { getPublicData } from "@/Components/helpers/getPublicData";
import ServicePackagePage, {
  ServicepackagePageProps,
} from "@/Components/ServicePackage/ServicePackagePage";
import { notFound } from "next/navigation";

const ServicePackage = async (ctx: { params: { slug: string } }) => {
  const data = await getPublicData<ServicepackagePageProps>(
    `/servicePackage/${ctx.params.slug}`,
  );
  if (!data) return notFound();
  return <ServicePackagePage {...data} />;
};

export default ServicePackage;
