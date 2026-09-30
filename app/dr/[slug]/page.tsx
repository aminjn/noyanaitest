import NewDoctorProfilePage from "@/Components/Dr/New/NewPublicDoctorProfilePage";
import { PublicDoctorProfilePageProps } from "@/Components/Dr/publicDoctorTypes";
import { getPublicData } from "@/Components/helpers/getPublicData";
import { notFound, permanentRedirect } from "next/navigation";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import { nodeFallbackMetadata } from "@/Components/helpers/getPageMetadata";
import JsonLdSchema from "@/Components/UI/JsonLdSchema";
import { DOMAIN, FilePath } from "@/Components/config";
import { getDoctorProfileLabel } from "@/Components/Admin/Lib/LabelGetters";

const NS: ContentNamespace[] = [
  "drProfile",
  "drBookingSidebar",
  "drSelectClinicFirstPopup",
  "drSessions",
  "bookingSessionSelectorPopup",
  "commentSection",
];

// The bookable doctor profile had no metadata at all (only the site title)
// and no structured data - the page search engines most need to index.
export const generateMetadata = async ({
  params: { slug },
}: {
  params: { slug: string };
}) => {
  const data = await getPublicData<PublicDoctorProfilePageProps>(`dr/${slug}`);
  const doctor = data?.doctor;
  if (!doctor) return {};
  return nodeFallbackMetadata(
    {
      name: [getDoctorProfileLabel(doctor), doctor.mainSpeciality?.name]
        .filter(Boolean)
        .join(" - "),
      summary: doctor.introduction,
      avatar: doctor.avatar,
    },
    `/dr/${doctor.slug || doctor._id}`,
  );
};

const physicianSchema = (doctor: PublicDoctorProfilePageProps["doctor"]) => ({
  "@context": "https://schema.org",
  "@type": "Physician",
  name: getDoctorProfileLabel(doctor),
  url: `${DOMAIN.replace(/\/$/, "")}/dr/${doctor.slug || doctor._id}`,
  ...(doctor.avatar && { image: `${FilePath}/${doctor.avatar}` }),
  ...(doctor.mainSpeciality?.name && {
    medicalSpecialty: doctor.mainSpeciality.name,
  }),
  ...(!!doctor.feedbackCount &&
    !!doctor.averageScore && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: Number(doctor.averageScore.toFixed(1)),
        reviewCount: doctor.feedbackCount,
        bestRating: 5,
      },
    }),
});

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
  // one URL per doctor: an id link moves to the slug
  const requested = (() => {
    try {
      return decodeURIComponent(slug);
    } catch {
      return slug;
    }
  })();
  if (data.doctor.slug && requested !== data.doctor.slug)
    permanentRedirect(`/dr/${encodeURIComponent(data.doctor.slug)}`);
  return (
    <>
      <JsonLdSchema schema={physicianSchema(data.doctor)} />
      <LocaleScopeProvider namespaces={NS} initialTextContent={textContent}>
        <NewDoctorProfilePage {...data} />
      </LocaleScopeProvider>
    </>
  );
};

export default PublicDoctorProfile;
