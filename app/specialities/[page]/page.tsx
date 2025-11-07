import { getPublicData } from "@/Components/helpers/getPublicData";
import SpecialitiesPage, {
  SpecialitiesPageProps,
} from "@/Components/Speciality/SpecialitiesPage";
import { notFound } from "next/navigation";

const Specialities = async ({
  params: { page: _page },
}: {
  params: { page: string };
}) => {
  const page = Number(_page);
  if (isNaN(page) || !Number.isInteger(page) || page < 1) return notFound();
  const data = await getPublicData<SpecialitiesPageProps>(
    `speciality?page=${page}`
  );
  if (!data) return notFound();
  return <SpecialitiesPage {...data} />;
};

export default Specialities;
