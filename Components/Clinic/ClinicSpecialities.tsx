import useLocale from "../Hooks/useLocale";
import StetoscopeIcon from "../Icons/StetoscopeIcon";
import Badge from "../UI/Badge";
import IconTitle from "../UI/IconTitle";
import { ClinicPageNode } from "./ClinicPage";
import classes from "./ClinicSpecialities.module.css";
import MedicalCenterSpecialities from "./MedicalCenterSpecialities";

const ClinicSpecialities = ({ node }: { node: ClinicPageNode }) => {
  return <MedicalCenterSpecialities nodes={node.specialities} />;
};

export default ClinicSpecialities;
