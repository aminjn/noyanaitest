import DoctorPage, { DoctorPageProps } from "@/Components/Doctor/DoctorPage";
import { getPublicData } from "@/Components/helpers/getPublicData";
import { notFound } from "next/navigation";

const Doctor = async ({ params: { slug } }: { params: { slug: string } }) => {
  const data = await getPublicData<DoctorPageProps>(
    `doctor/${slug}`
    // (res: any) => res.data.data
  );
  if (!data) return notFound();
  return <DoctorPage data={data.data} faqs={data.faqs} />;
};

export default Doctor;
