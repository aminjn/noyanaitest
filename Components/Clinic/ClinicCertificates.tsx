import CheckIcon from "../Icons/CheckIcon";
import Badge from "../UI/Badge";
import IconTitle from "../UI/IconTitle";
import classes from "./ClinicCertificates.module.css";
import { ClinicPageNode } from "./ClinicPage";
import MedicalCenterCertificates from "./MedicalCenterCertificates";
const ClinicCertificates = ({ node }: { node: ClinicPageNode }) => {
  return <MedicalCenterCertificates nodes={node.certificates || []} />;
};

export default ClinicCertificates;
