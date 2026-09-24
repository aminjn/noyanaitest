import { getDoctorProfileLabel } from "../Admin/Lib/LabelGetters";
import LocationIcon from "../Icons/LocationIcon";
import IconTitle from "../UI/IconTitle";
import { tsmRegular, txsDemiBold, txsRegular } from "../UI/Typography";
import classes from "./ClinicContact.module.css";
import { ClinicPageNode } from "./ClinicPage";
import MedicalCenterContactInfo from "./MedicalCenterContactInfo";
const ClinicContact = ({ node }: { node: ClinicPageNode }) => {
  return (
    <MedicalCenterContactInfo
      address={node.address}
      businessTimes={node.businessTimes}
      mail={node.mail}
      owner={node.owner ? getDoctorProfileLabel(node.owner) : undefined}
      phone={node.phone}
      website={node.website}
    />
  );
};

export default ClinicContact;
