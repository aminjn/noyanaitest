import classes from "./PrescriptionProTip.module.css";
import Ixon from "@/Components/UI/Ixon";
import AlertCircleIcon from "@/Components/Icons/AlertCircleIcon";
import useLocale from "@/Components/Hooks/useLocale";
const PrescriptionProTip = () => {
  const getContent = useLocale();
  return (
    <div className={classes.proTip}>
      <Ixon width="1rem">
        <AlertCircleIcon />
      </Ixon>
      <span>{getContent("selectPatientProfileTip")}</span>
    </div>
  );
};

export default PrescriptionProTip;
