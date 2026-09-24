import HeartIcon from "../Icons/HeartIcon";
import MedalIcon from "../Icons/MedalIcon";
import IconTitle from "../UI/IconTitle";
import Ixon from "../UI/Ixon";
import { tsmRegular } from "../UI/Typography";
import { ClinicPageNode } from "./ClinicPage";
import classes from "./ClinicServices.module.css";
import MedicalCenterServices from "./MedicalCenterServices";

const ClinicServices = ({ node }: { node: ClinicPageNode }) => {
  return <MedicalCenterServices nodes={node.services || []} />;
};

export default ClinicServices;
