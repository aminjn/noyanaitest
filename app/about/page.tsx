import AboutPage, { AboutPageProps } from "@/Components/About/AboutPage";
import { getPublicData } from "@/Components/helpers/getPublicData";
import { notFound } from "next/navigation";
import {
  getListPageMetadata,
  getListPageWebSchema,
} from "@/Components/helpers/getPageMetadata";
import JsonLdSchema from "@/Components/UI/JsonLdSchema";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const NS: ContentNamespace[] = ["aboutPage"];

export const generateMetadata = () => getListPageMetadata("/about");

const About = async () => {
  const [data, textContent] = await Promise.all([
    getPublicData<AboutPageProps>("about"),
    getScopedTextContent(NS),
  ]);
  if (!data) return notFound();
  const webSchema = await getListPageWebSchema("/about");
  return (
    <>
      <JsonLdSchema schema={webSchema} />
      <LocaleScopeProvider namespaces={NS} initialTextContent={textContent}>
        <AboutPage {...data} />
      </LocaleScopeProvider>
    </>
  );
};

export default About;
