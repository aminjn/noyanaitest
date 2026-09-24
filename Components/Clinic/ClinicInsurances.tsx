import Badge from "../UI/Badge";
import IconTitle from "../UI/IconTitle";
import classes from "./ClinicInsurances.module.css";
import { ClinicPageNode } from "./ClinicPage";
import MedicalCenterInsurances from "./MedicalCenterInsurances";
const ClinicInsurances = ({ node }: { node: ClinicPageNode }) => {
  return (
    <MedicalCenterInsurances nodes={node.insurances} title="clinicInsurances" />
  );
};

export default ClinicInsurances;
