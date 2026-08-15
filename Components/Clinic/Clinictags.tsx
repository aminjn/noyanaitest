import useLocale from "../Hooks/useLocale";
import CheckCircleIcon from "../Icons/CheckCircleIcon";
import Badge from "../UI/Badge";
import IconTitle from "../UI/IconTitle";
import { ClinicPageNode } from "./ClinicPage";
import classes from "./Clinictags.module.css";
import MedicalCenterTagList from "./MedicalCenterTagList";

const ClinicTags = ({ node }: { node: ClinicPageNode }) => {
  return <MedicalCenterTagList tags={node.tags} />;
};

export default ClinicTags;
