import PublicDoctorProfilePage, {
  PublicDoctorProfilePageProps,
} from "@/Components/Dr/PublicDoctorProfilePage";
import { getPublicData } from "@/Components/helpers/getPublicData";
import { notFound } from "next/navigation";

const PublicDoctorProfile = async ({
  params: { slug },
}: {
  params: { slug: string };
}) => {
  const data = await getPublicData<PublicDoctorProfilePageProps>(`dr/${slug}`);
  if (!data) return notFound();
  return <PublicDoctorProfilePage {...data} />;
};

export default PublicDoctorProfile;
