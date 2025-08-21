import classes from "./DeleteDoctorSecretaryRequestPopup.module.css";
import { IDoctorSecretaryRequest } from "./DoctorSecretaryRequestsTab";

const DeleteDoctorSecretaryRequestPopup = ({
  mutate,
  node,
}: {
  mutate: () => unknown;
  node: IDoctorSecretaryRequest;
}) => {
  return <p>DeleteDoctorSecretaryRequestPopup</p>;
};

export default DeleteDoctorSecretaryRequestPopup;
