import Ixon from "@/Components/UI/Ixon";
import classes from "./PrescriptionListItem.module.css";
import FolderIcon from "@/Components/Icons/FolderIcon";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import { ReactNode } from "react";
import { IncomingTaminPharmacyResponse } from "./FindPrescriptionAgent";

const NS: ContentNamespace[] = ["common", "pharmacyPanelPrescription"];

const PrescriptionListItem = ({
  prescription,
  action,
}: {
  prescription: IncomingTaminPharmacyResponse["list"][number];
  action?: ReactNode;
}) => {
  const getContent = useScopedLocale(NS);

  return (
    <div className={classes.item} key={prescription.headeprscid}>
      <div className={classes.start}>
        <Ixon width="1.25rem">
          <FolderIcon />
        </Ixon>
        <span>{`${getContent("prescriptionId")}: ${prescription.headeprscid}`}</span>
        <span>{`${getContent("doctorName")}: ${prescription.doctorFullName}`}</span>
      </div>
      <div className={classes.end}>
        <span>{`${getContent("prescriptionDate")}: ${prescription.prescdate}`}</span>
        {action}
      </div>
    </div>
  );
};

export default PrescriptionListItem;
