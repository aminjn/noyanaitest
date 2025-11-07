import { getPublicData } from "@/Components/helpers/getPublicData";
import SpecialityPage, {
  SpecialityPageProps,
} from "@/Components/Speciality/SpecialityPage";
import { notFound } from "next/navigation";

const Speciality = async ({
  params: { slug },
}: {
  params: { slug: string };
}) => {
  const data = await getPublicData<SpecialityPageProps>(
    `speciality/${slug}?page=1`
  );
  if (!data) return notFound();
  return <SpecialityPage {...data} />;
};

export default Speciality;
