"use client";
import { ITestify } from "../Admin/Testify/AdminManageTestifiesPage";
import { IStaticImages } from "../Admin/StaticImages/AdminManageStaticImagesPage";
import OnboardingAi from "./OnboardingAi";
import OnboardingClinic from "./OnboardingClinic";
import OnboardingConsult from "./OnboardingConsult";
import OnboardingDoctor from "./OnboardingDoctor";
import OnboardingFeatures from "./OnboardingFeatures";
import OnboardingIntro from "./OnboardingIntro";
import OnboardingMap from "./OnboardingMap";
import classes from "./OnBoardingPage.module.css";
import OnboardingProfile from "./OnboardingProfile";
import OnboardingTestify from "./OnboardingTestify";

export type OnboardingpageProps = {
  data: ITestify[];
  staticImages: IStaticImages;
};

const OnboardingPage = ({ data, staticImages }: OnboardingpageProps) => {
  return (
    <div className={classes.main}>
      <OnboardingIntro />
      <OnboardingAi />
      <OnboardingProfile onboadingProfile={staticImages?.onboadingProfile} />
      <OnboardingMap />
      <OnboardingDoctor />
      <OnboardingClinic onboadingClinic={staticImages?.onboadingClinic} />
      <OnboardingConsult
        onboadrdinConsult={staticImages?.onboadrdinConsult}
      />
      <OnboardingTestify data={data} />
      <OnboardingFeatures />
    </div>
  );
};

export default OnboardingPage;
