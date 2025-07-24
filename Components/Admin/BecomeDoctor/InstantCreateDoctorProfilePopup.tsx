import { IUser } from "@/Components/Hooks/useUser";
import classes from "./InstantCreateDoctorProfilePopup.module.css";

const InstantCreateDoctorProfilePopup = ({
  mutate,
  user,
}: {
  user: IUser;
  mutate: () => unknown;
}) => {
  return <p>InstantCreateDoctorProfilePopup</p>;
};

export default InstantCreateDoctorProfilePopup;
