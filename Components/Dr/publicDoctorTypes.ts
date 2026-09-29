import { IDoctorProfile } from "../DoctorPanel/DoctorPanelPage";
import { IDoctorFaq } from "../DoctorPanel/Profile/DoctorManageFaqTab";

// Data of the public doctor profile page (GET /public/dr/:slug).
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
