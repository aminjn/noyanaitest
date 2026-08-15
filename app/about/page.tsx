import AboutPage, { AboutPageProps } from "@/Components/About/AboutPage";
import { getPublicData } from "@/Components/helpers/getPublicData";
import { notFound } from "next/navigation";

const About = async () => {
  const data = await getPublicData<AboutPageProps>("about");
  if (!data) return notFound();
  return <AboutPage {...data} />;
};

export default About;
