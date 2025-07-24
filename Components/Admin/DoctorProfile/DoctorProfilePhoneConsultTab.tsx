import { IDoctorProfile } from "@/Components/DoctorPanel/DoctorPanelPage";
import classes from "./DoctorProfilePhoneConsultTab.module.css";

const DoctorProfilePhoneConsultTab = ({
  mutate,
  node,
}: {
  node: IDoctorProfile<{ PhoneConsultSettingsPopulated: true }>;
  mutate: () => unknown;
}) => {
  return <p>DoctorProfilePhoneConsultTab</p>;
};

export default DoctorProfilePhoneConsultTab;
