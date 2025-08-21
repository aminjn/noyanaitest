import { IDoctorSecretaryAccessLevel } from "./AdminManageDoctorSecretaryAccessLevelsPage";
import classes from "./DeleteDoctorSecretaryAccessLevelPopup.module.css";

const DeleteDoctorSecretaryAccessLevelPopup = ({
  mutate,
  node,
}: {
  node: IDoctorSecretaryAccessLevel;
  mutate: () => unknown;
}) => {
  return <p>DeleteDoctorSecretaryAccessLevelPopup</p>;
};

export default DeleteDoctorSecretaryAccessLevelPopup;
