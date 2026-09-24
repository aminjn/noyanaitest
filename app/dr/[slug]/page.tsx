import NewDoctorProfilePage from "@/Components/Dr/New/NewPublicDoctorProfilePage";
import PublicDoctorProfilePage, {
  PublicDoctorProfilePageProps,
} from "@/Components/Dr/PublicDoctorProfilePage";
import { getPublicData } from "@/Components/helpers/getPublicData";
import { notFound } from "next/navigation";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const NS: ContentNamespace[] = [
  "drProfile",
  "drBookingSidebar",
  "drSelectClinicFirstPopup",
  "drSessions",
  "bookingSessionSelectorPopup",
  "commentSection",
];

const PublicDoctorProfile = async ({
  params: { slug },
}: {
  params: { slug: string };
}) => {
  const [data, textContent] = await Promise.all([
    getPublicData<PublicDoctorProfilePageProps>(`dr/${slug}`),
    getScopedTextContent(NS),
  ]);
  if (!data) return notFound();
  return (
    <LocaleScopeProvider namespaces={NS} initialTextContent={textContent}>
      <NewDoctorProfilePage {...data} />
    </LocaleScopeProvider>
  );
  // return <PublicDoctorProfilePage {...data} />;
};

export default PublicDoctorProfile;
