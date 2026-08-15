import DoctorPage, { DoctorPageProps } from "@/Components/Doctor/DoctorPage";
import { getPublicData } from "@/Components/helpers/getPublicData";
import { notFound } from "next/navigation";
import {
  getNodePageMetadata,
  getNodePageWebSchema,
} from "@/Components/helpers/getPageMetadata";
import JsonLdSchema from "@/Components/UI/JsonLdSchema";

export const generateMetadata = ({
  params: { slug },
}: {
  params: { slug: string };
}) => getNodePageMetadata("/doctor/[slug]", slug);

const Doctor = async ({ params: { slug } }: { params: { slug: string } }) => {
  const data = await getPublicData<DoctorPageProps>(
    `doctor/${slug}`
    // (res: any) => res.data.data
  );
  if (!data) return notFound();
  const webSchema = await getNodePageWebSchema("/doctor/[slug]", slug);
  return (
    <>
      <JsonLdSchema schema={webSchema} />
      <DoctorPage data={data.data} faqs={data.faqs} />
    </>
  );
};

export default Doctor;
