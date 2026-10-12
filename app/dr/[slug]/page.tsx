import NewDoctorProfilePage from "@/Components/Dr/New/NewPublicDoctorProfilePage";
import { PublicDoctorProfilePageProps } from "@/Components/Dr/publicDoctorTypes";
import { getPublicData } from "@/Components/helpers/getPublicData";
import { notFound, permanentRedirect } from "next/navigation";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import {
  getNodePageWebSchema,
  nodeFallbackMetadata,
  withNodePageMeta,
} from "@/Components/helpers/getPageMetadata";
import JsonLdSchema from "@/Components/UI/JsonLdSchema";
import { DOMAIN, FilePath } from "@/Components/config";
import { getDoctorProfileLabel } from "@/Components/Admin/Lib/LabelGetters";
import { AutoFaqPayload, doctorPageFaq, withFaqPage } from "@/Components/Seo/autoFaq";
import { getServerFaqContext } from "@/Components/Seo/serverFaqContext";

const NS: ContentNamespace[] = [
  "drProfile",
  "drBookingSidebar",
  "bookingFlow",
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
  // the admin's SEO entry (doctor record > «سئو») wins field by field
  return withNodePageMeta(
    "/dr/[slug]",
    doctor.slug || slug,
    nodeFallbackMetadata(
      {
        name: [getDoctorProfileLabel(doctor), doctor.mainSpeciality?.name]
          .filter(Boolean)
          .join(" - "),
        summary: doctor.introduction,
        avatar: doctor.avatar,
      },
      `/dr/${doctor.slug || doctor._id}`,
    ),
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
  const [data, textContent, faqCtx] = await Promise.all([
    getPublicData<PublicDoctorProfilePageProps & { autoFaq?: AutoFaqPayload }>(`dr/${slug}`),
    getScopedTextContent(NS),
    getServerFaqContext(),
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
  // a structured-data block set in the admin replaces the generated one
  const adminSchema = data.doctor.slug
    ? await getNodePageWebSchema("/dr/[slug]", data.doctor.slug)
    : undefined;
  // the FAQ block and its FAQPage data from one list (Google wants the
  // structured Q&A to be the visible one): the automatic questions built
  // from the doctor's data with their changes, then their own questions
  const { autoFaq, ...pageData } = data;
  // only this doctor's own questions: the ones once shared by every doctor
  // page (no doctor) are archived, the automatic FAQ replaces them
  const ownFaqs = (Array.isArray(data.faqs) ? data.faqs : []).filter((f) => !!f?.doctor && !f.archived);
  const faqItems = doctorPageFaq(autoFaq, data.doctor, ownFaqs, faqCtx);
  const pageUrl = `${DOMAIN.replace(/\/$/, "")}/dr/${data.doctor.slug || data.doctor._id}`;
  return (
    <>
      <JsonLdSchema
        schema={withFaqPage(adminSchema || physicianSchema(data.doctor), faqItems, pageUrl)}
      />
      <LocaleScopeProvider namespaces={NS} initialTextContent={textContent}>
        <NewDoctorProfilePage {...pageData} faqItems={faqItems} />
      </LocaleScopeProvider>
    </>
  );
};

export default PublicDoctorProfile;
