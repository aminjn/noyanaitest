import { IDoctorProfile } from "../DoctorPanel/DoctorPanelPage";
import classes from "./DoctorTooltip.module.css";

const DoctorTooltip = ({
  node,
  travel,
}: {
  node: IDoctorProfile;
  // e.g. "12 min by car", when the visitor's location is known
  travel?: string;
}) => {
  return (
    <p className={classes.main}>
      {`${node.firstName || ""} ${node.lastName || ""}`.trim()}
      {!!travel && <span className={classes.travel}>{travel}</span>}
    </p>
  );
};

export default DoctorTooltip;
