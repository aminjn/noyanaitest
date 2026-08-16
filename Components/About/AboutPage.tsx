"use client";
import { IAboutPartner } from "../Admin/AboutPartner/AdminManageAboutPartnersPage";
import { IAboutTeam } from "../Admin/AboutTeam/AdminManageAboutTeamsPage";
import { IAboutWhy } from "../Admin/AboutWhy/AdminManageAboutWhysPage";
import AboutCta from "./AboutCta";
import AboutIntro from "./AboutIntro";
import AboutMissions from "./AboutMissions";
import classes from "./AboutPage.module.css";
import AboutPartners from "./AboutPartners";
import AboutPrinciples from "./AboutPrinciples";
import AboutPrivacy from "./AboutPrivacy";
import AboutStats from "./AboutStats";
import AboutStories from "./AboutStories";
import AboutTeam from "./AboutTeam";
import AboutWhys from "./AboutWhys";
import BreadCrump from "../UI/BreadCrump";

export type AboutPageProps = {
  whys: IAboutWhy[];
  partners: IAboutPartner[];
  team: IAboutTeam[];
};

const AboutPage = ({ partners, team, whys }: AboutPageProps) => {
  console.log({ partners, team, whys });

  return (
    <div className={classes.main}>
      <BreadCrump
        trail={[
          { title: "صفحه اصلی", target: "/" },
          { title: "درباره ما", target: "/about" },
        ]}
        className={classes.crump}
      />
      <AboutIntro />
      <AboutStories />
      <AboutMissions />
      <AboutWhys items={whys.filter((el) => el.elem === "Why")} />
      <AboutStats />
      <AboutPrinciples items={whys.filter((el) => el.elem === "Principle")} />
      <AboutPrivacy />
      <AboutTeam team={team} />
      <AboutCta />
      <AboutPartners items={partners} />
    </div>
  );
};

export default AboutPage;
