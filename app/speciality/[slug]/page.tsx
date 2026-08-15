import { getPublicData } from "@/Components/helpers/getPublicData";
import SpecialityPage, {
  SpecialityPageProps,
} from "@/Components/Speciality/SpecialityPage";
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
}) => getNodePageMetadata("/speciality/[slug]", slug);

const Speciality = async ({
  params: { slug },
  searchParams,
}: {
  params: { slug: string };
  searchParams: Promise<{ page?: string }>;
}) => {
  const { page: _page } = await searchParams;
  const page = Number(_page || 1);
  if (isNaN(page) || !Number.isInteger(page) || page < 1) return notFound();
  const params = new URLSearchParams();
  params.append("page", page.toString());
  const data = await getPublicData<SpecialityPageProps>(
    `speciality/${slug}?${params.toString()}`,
  );

  if (!data) return notFound();
  const webSchema = await getNodePageWebSchema("/speciality/[slug]", slug);
  return (
    <>
      <JsonLdSchema schema={webSchema} />
      <SpecialityPage {...data} />
    </>
  );
};

export default Speciality;
