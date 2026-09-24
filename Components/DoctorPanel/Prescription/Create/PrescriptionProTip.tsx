import classes from "./PrescriptionProTip.module.css";
import Ixon from "@/Components/UI/Ixon";
import AlertCircleIcon from "@/Components/Icons/AlertCircleIcon";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const LOCALE_NS: ContentNamespace[] = ["common", "doctorPanelPrescriptionEditor"];
const PrescriptionProTip = () => {
  const getContent = useScopedLocale(LOCALE_NS);
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
