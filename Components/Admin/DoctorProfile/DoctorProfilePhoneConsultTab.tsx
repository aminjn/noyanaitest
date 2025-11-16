import { IDoctorProfile } from "@/Components/DoctorPanel/DoctorPanelPage";
import classes from "./DoctorProfilePhoneConsultTab.module.css";

const DoctorProfilePhoneConsultTab = ({
  mutate,
  node,
}: {
  node: IDoctorProfile<{ PhoneConsultSettingsPopulated: Record<never, never> }>;
  mutate: () => unknown;
}) => {
  return <p>DoctorProfilePhoneConsultTab</p>;
};

export default DoctorProfilePhoneConsultTab;
