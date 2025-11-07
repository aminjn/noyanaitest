import { getPublicData } from "@/Components/helpers/getPublicData";
import SpecialityPage, {
  SpecialityPageProps,
} from "@/Components/Speciality/SpecialityPage";
import { notFound } from "next/navigation";

const Speciality = async ({
  params: { slug, page: _page },
}: {
  params: { slug: string; page: string };
}) => {
  const page = Number(_page);
  if (isNaN(page) || !Number.isInteger(page) || page < 1) return notFound();
  const data = await getPublicData<SpecialityPageProps>(
    `speciality/${slug}?page=${page}`
  );
  if (!data) return notFound();
  return <SpecialityPage {...data} />;
};

export default Speciality;
