import { IUser } from "@/Components/Hooks/useUser";
import classes from "./CloneDoctorProfileFromExistingDoctorPopup.module.css";

const CloneDoctorProfileFromExistingDoctorPopup = ({
  mutate,
  user,
}: {
  mutate: () => unknown;
  user: IUser;
}) => {
  return <p>CloneDoctorProfileFromExistingDoctorPopup</p>;
};

export default CloneDoctorProfileFromExistingDoctorPopup;
