import { IUser } from "@/Components/Hooks/useUser";
import classes from "./AssignProfileToUserPopup.module.css";
import { IDoctorProfile } from "@/Components/DoctorPanel/DoctorPanelPage";

const AssignDoctorProfileToUserPopup = ({
  mutate,
  profile,
  user,
}: {
  mutate: () => unknown;
  user?: IUser;
  profile?: IDoctorProfile;
}) => {
  return <p>AssignProfileToUserPopup</p>;
};

export default AssignDoctorProfileToUserPopup;
