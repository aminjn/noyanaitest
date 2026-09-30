"use client";

import { IAdvertisement } from "../Admin/Advertisement/AdminManageAdvertisementsPage";
import { IBlog } from "../Admin/Blog/AdminManageBlogsPage";
import { IFaq } from "../Admin/Faq/AdminManageFaqsPage";
import { IHomeIntroduction } from "../Admin/HomeIntroduction/AdminManageHomeIntroductionsPage";
import { IStaticImages } from "../Admin/StaticImages/AdminManageStaticImagesPage";
import { IService } from "../Admin/Service/AdminManageServicesPage";
import { ISpeciality } from "../Admin/Speciality/AdminManageSpecialitiesPage";
import { IDoctorProfile } from "../DoctorPanel/DoctorPanelPage";
import BigAd from "../UI/ListPage/BigAd";
import SmallAd from "../UI/ListPage/SmallAd";
import HomeAds from "./HomeAds";
import HomeAds2 from "./HomeAds2";
import HomeAdSlider from "./HomeAdSlider";
import HomeBlogs from "./HomeBlogs";
import HomeFaqs from "./HomeFaqs";
import HomeHero from "./HomeHero";
import HomeIntroduction from "./HomeIntroduction";
import classes from "./HomePage.module.css";
import HomePharmacyProducts from "./HomePharmacyProducts";
import HomePopular from "./HomePopular";
import HomeRegister from "./HomeRegister";
import HomeServices from "./HomeServices";
import HomeSpecialities from "./HomeSpecialities";
import { SiteStats } from "../helpers/siteStats";

export type HomePageProps = Partial<{
  stats: SiteStats;
  introduction: IHomeIntroduction[];
  specialities: ISpeciality[];
  advertisements: IAdvertisement[];
  popularDoctors: IDoctorProfile<{
    MainSpecialityPopulated: Record<never, never>;
    TextChatSettings: Record<never, never>;
    SipCallSettings: Record<never, never>;
    InPersonSettings: Record<never, never>;
    VideoCallSettings: Record<never, never>;
    VoiceCallSettings: Record<never, never>;
    Province: Record<never, never>;
    // PhoneConsultSettingsPopulated: Record<never, never>;
  }>[];
  services: IService<{ Owner: Record<never, never> }>[];
  sliderAds: IAdvertisement[];
  faqs: IFaq[];
  blogs: IBlog<{ CategoryPopulated: Record<never, never> }>[];
  staticImages: IStaticImages;
}>;

const HomePage = ({
  introduction,
  specialities,
  advertisements,
  popularDoctors,
  services,
  sliderAds,
  faqs,
  blogs,
  staticImages,
  stats,
}: HomePageProps) => {
  return (
    <main className={classes.main}>
      <HomeHero homeMain={staticImages?.homeMain} />
      {/* <HomeIntroduction nodes={introduction} /> */}
      <HomeSpecialities nodes={specialities} />
      {/* <HomeAds nodes={advertisements} /> */}
      <BigAd position="home1" />
      <HomePopular nodes={popularDoctors} />
      <HomeAds2 />
      <HomeServices nodes={services} />
      <HomePharmacyProducts />
      <HomeRegister stats={stats} />
      <div className={classes.ads}>
        <SmallAd position="home5" />
        <SmallAd position="home6" />
      </div>
      {/* <HomeAdSlider nodes={sliderAds} /> */}
      <HomeBlogs nodes={blogs} />
      <HomeFaqs nodes={faqs} />
    </main>
  );
};

export default HomePage;
