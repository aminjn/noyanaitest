import AboutPage, { AboutPageProps } from "@/Components/About/AboutPage";
import { getPublicData } from "@/Components/helpers/getPublicData";
import { notFound } from "next/navigation";
import {
  getListPageMetadata,
  getListPageWebSchema,
} from "@/Components/helpers/getPageMetadata";
import JsonLdSchema from "@/Components/UI/JsonLdSchema";

export const generateMetadata = () => getListPageMetadata("/about");

const About = async () => {
  const data = await getPublicData<AboutPageProps>("about");
  if (!data) return notFound();
  const webSchema = await getListPageWebSchema("/about");
  return (
    <>
      <JsonLdSchema schema={webSchema} />
      <AboutPage {...data} />
    </>
  );
};

export default About;
