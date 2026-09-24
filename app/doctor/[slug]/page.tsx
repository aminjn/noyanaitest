import DoctorPage, { DoctorPageProps } from "@/Components/Doctor/DoctorPage";
import { getPublicData } from "@/Components/helpers/getPublicData";
import { notFound } from "next/navigation";
import {
  getNodePageMetadata,
  getNodePageWebSchema,
} from "@/Components/helpers/getPageMetadata";
import JsonLdSchema from "@/Components/UI/JsonLdSchema";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const NS: ContentNamespace[] = ["common", "doctorPage"];

export const generateMetadata = ({
  params: { slug },
}: {
  params: { slug: string };
}) => getNodePageMetadata("/doctor/[slug]", slug);

const Doctor = async ({ params: { slug } }: { params: { slug: string } }) => {
  const [data, textContent] = await Promise.all([
    getPublicData<DoctorPageProps>(
      `doctor/${slug}`
      // (res: any) => res.data.data
    ),
    getScopedTextContent(NS),
  ]);
  if (!data) return notFound();
  const webSchema = await getNodePageWebSchema("/doctor/[slug]", slug);
  return (
    <>
      <JsonLdSchema schema={webSchema} />
      <LocaleScopeProvider namespaces={NS} initialTextContent={textContent}>
        <DoctorPage data={data.data} faqs={data.faqs} />
      </LocaleScopeProvider>
    </>
  );
};

export default Doctor;
