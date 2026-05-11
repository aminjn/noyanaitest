import { getPublicData } from "@/Components/helpers/getPublicData";
import HomePage, { HomePageProps } from "@/Components/Home/HomePage";

const Home = async () => {
  const data = await getPublicData<HomePageProps>("home");

  return <HomePage {...data} />;
};

export default Home;
