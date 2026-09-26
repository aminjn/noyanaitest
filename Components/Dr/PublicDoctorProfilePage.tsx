"use client";
import { IDoctorProfile } from "../DoctorPanel/DoctorPanelPage";
import { IDoctorFaq } from "../DoctorPanel/Profile/DoctorManageFaqTab";
import FaqList from "../UI/FaqList";
import DrIntroduction from "./DrtIntroduction";
import classes from "./PublicDoctorProfilePage.module.css";
import PublicDrIntro from "./PublicDrIntro";
import BreadCrump from "../UI/BreadCrump";
import useScopedLocale from "../Hooks/useScopedLocale";

export type PublicDoctorProfilePageProps = {
  doctor: IDoctorProfile<{
    MainSpecialityPopulated: Record<never, never>;
    Mc: Record<never, never>;
    Gallery: Record<never, never>;
    Offices: Record<never, never>;
    Socials: Record<never, never>;
  }>;
  faqs: IDoctorFaq[];
};

const PublicDoctorProfilePage = ({
  doctor,
  faqs,
}: PublicDoctorProfilePageProps) => {
  const getContent = useScopedLocale();
  const fullName =
    `${doctor.firstName || ""} ${doctor.lastName || ""}`.trim() || doctor._id;

  return (
    <div>
      <BreadCrump
        trail={[
          { title: getContent("homePage"), target: "/" },
          { title: getContent("doctors"), target: "/doctors" },
          { title: fullName, target: `/dr/${doctor.slug || doctor._id}` },
        ]}
        className={classes.crump}
      />
      <PublicDrIntro doctor={doctor} />
      <DrIntroduction doctor={doctor} />
      <FaqList items={faqs} />
    </div>
  );
};

export default PublicDoctorProfilePage;
