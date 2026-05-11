"use client";

import { IAdvertisement } from "../Admin/Advertisement/AdminManageAdvertisementsPage";
import { IAiExample } from "../Admin/AiExample/AdminManageAiExamplesPage";
import { IFaq } from "../Admin/Faq/AdminManageFaqsPage";
import { IHomeIntroduction } from "../Admin/HomeIntroduction/AdminManageHomeIntroductionsPage";
import { IService } from "../Admin/Service/AdminManageServicesPage";
import { ISpeciality } from "../Admin/Speciality/AdminManageSpecialitiesPage";
import { IDoctorProfile } from "../DoctorPanel/DoctorPanelPage";
import HomeAds from "./HomeAds";
import HomeAdSlider from "./HomeAdSlider";
import HomeFaqs from "./HomeFaqs";
import HomeHero from "./HomeHero";
import HomeIntroduction from "./HomeIntroduction";
import classes from "./HomePage.module.css";
import HomePopular from "./HomePopular";
import HomeRegister from "./HomeRegister";
import HomeServices from "./HomeServices";
import HomeSpecialities from "./HomeSpecialities";

export type HomePageProps = Partial<{
  examples: IAiExample[];
  introduction: IHomeIntroduction[];
  specialities: ISpeciality[];
  advertisements: IAdvertisement[];
  popularDoctors: IDoctorProfile<{
    MainSpecialityPopulated: Record<never, never>;
  }>[];
  services: IService<{ Owner: Record<never, never> }>[];
  sliderAds: IAdvertisement[];
  faqs: IFaq[];
}>;

const HomePage = ({
  examples,
  introduction,
  specialities,
  advertisements,
  popularDoctors,
  services,
  sliderAds,
  faqs,
}: HomePageProps) => {
  return (
    <main className={classes.main}>
      <HomeHero examples={examples} />
      <HomeIntroduction nodes={introduction} />
      <HomeSpecialities nodes={specialities} />
      <HomeAds nodes={advertisements} />
      <HomePopular nodes={popularDoctors} />
      <HomeServices nodes={services} />
      <HomeRegister />
      <HomeAdSlider nodes={sliderAds} />
      <HomeFaqs nodes={faqs} />
    </main>
  );
};

export default HomePage;
