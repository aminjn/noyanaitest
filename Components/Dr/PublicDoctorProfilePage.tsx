"use client";
import { IDoctorProfile } from "../DoctorPanel/DoctorPanelPage";
import DrIntroduction from "./DrtIntroduction";
import classes from "./PublicDoctorProfilePage.module.css";
import PublicDrIntro from "./PublicDrIntro";

export type PublicDoctorProfilePageProps = {
  doctor: IDoctorProfile<{
    MainSpecialityPopulated: Record<never, never>;
    Mc: Record<never, never>;
    Gallery: Record<never, never>;
    Offices: Record<never, never>;
    Socials: Record<never, never>;
  }>;
};

export const DoctorProfileInner = () => {};

const PublicDoctorProfilePage = ({ doctor }: PublicDoctorProfilePageProps) => {
  console.log(doctor);
  return (
    <div className={classes.main}>
      <PublicDrIntro doctor={doctor} />
      <DrIntroduction doctor={doctor} />
    </div>
  );
};

export default PublicDoctorProfilePage;
