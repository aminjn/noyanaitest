import { IDoctorProfile } from "../DoctorPanel/DoctorPanelPage";
import classes from "./DoctorTooltip.module.css";

const DoctorTooltip = ({ node }: { node: IDoctorProfile }) => {
  return <p className={classes.main}>{`${node.firstName} ${node.lastName}`}</p>;
};

export default DoctorTooltip;
