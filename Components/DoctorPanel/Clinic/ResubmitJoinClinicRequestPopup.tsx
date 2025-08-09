import { Fragment, useState } from "react";
import classes from "./ResubmitJoinClinicRequestPopup.module.css";
import { IDoctorJoinClinicRequest } from "./DoctorJoinClinicsTab";
import usePopup from "@/Components/Hooks/usePopup";
import useLocale from "@/Components/Hooks/useLocale";
import ConfirmationPopup from "@/Components/Admin/UI/ConfirmationPopup";
import Act from "@/Components/UI/Act";
import { API } from "@/Components/config";

const ResubmitJoinClinicRequestPopup = ({
  node,
  mutate,
}: {
  node: IDoctorJoinClinicRequest;
  mutate: () => unknown;
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { closePopup } = usePopup();
  const getContent = useLocale();
  return (
    <Fragment>
      <ConfirmationPopup
        message={getContent("resubmitJoinClinicRequestConfirmationMessage")}
        onConfirm={() => setIsLoading(true)}
        isLoading={isLoading}
      />
      <Act
        path={isLoading ? `${API}/doctor/clinicjoin/${node._id}` : null}
        method="PUT"
        onDone={(status) => {
          setIsLoading(false);
          if (!status) return;
          mutate();
          closePopup();
        }}
      />
    </Fragment>
  );
};

export default ResubmitJoinClinicRequestPopup;
