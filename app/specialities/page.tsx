import { getPublicData } from "@/Components/helpers/getPublicData";
import SpecialitiesPage, {
  SpecialitiesPageProps,
} from "@/Components/Speciality/SpecialitiesPage";
import { notFound } from "next/navigation";

const Specialities = async () => {
  const data = await getPublicData<SpecialitiesPageProps>(
    `speciality?page=${1}`
  );
  if (!data) return notFound();
  return <SpecialitiesPage {...data} />;
};

export default Specialities;
