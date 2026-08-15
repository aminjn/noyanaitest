"use client";
import { ITestify } from "../Admin/Testify/AdminManageTestifiesPage";
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

export type OnboardingpageProps = { data: ITestify[] };

const OnboardingPage = ({ data }: OnboardingpageProps) => {
  return (
    <div className={classes.main}>
      <OnboardingIntro />
      <OnboardingAi />
      <OnboardingProfile />
      <OnboardingMap />
      <OnboardingDoctor />
      <OnboardingClinic />
      <OnboardingConsult />
      <OnboardingTestify data={data} />
      <OnboardingFeatures />
    </div>
  );
};

export default OnboardingPage;
