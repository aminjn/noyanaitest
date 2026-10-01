import { Fragment, useState } from "react";
import classes from "./ReloadPrescriptionFromTaminPopup.module.css";
import Act from "@/Components/UI/Act";
import { API } from "@/Components/config";
import { IPrescription } from "../Create/PrescriptionItemsOverview";
const ReloadPrescriptionFromTaminPopup = ({
  node,
}: {
  node: IPrescription;
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  return (
    <Fragment>
      <p>ReloadPrescriptionFromTaminPopup</p>
      <Act
        path={isLoading ? `${API}/doctor/presc/tamin/${node._id}` : null}
        onDone={(status, result) => {
          setIsLoading(false);
          if (!status) return;
        }}
      />
    </Fragment>
  );
};

export default ReloadPrescriptionFromTaminPopup;
