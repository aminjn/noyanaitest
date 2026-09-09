import { Fragment, useState } from "react";
import classes from "./ResubmitJoinHospitalRequestPopup.module.css";
import { IDoctorJoinHospitalRequest } from "./DoctorJoinHospitalsTab";
import usePopup from "@/Components/Hooks/usePopup";
import useLocale from "@/Components/Hooks/useLocale";
import ConfirmationPopup from "@/Components/Admin/UI/ConfirmationPopup";
import Act from "@/Components/UI/Act";
import { API } from "@/Components/config";

const ResubmitJoinHospitalRequestPopup = ({
  node,
  mutate,
}: {
  node: IDoctorJoinHospitalRequest;
  mutate: () => unknown;
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { closePopup } = usePopup();
  const getContent = useLocale();
  return (
    <Fragment>
      <ConfirmationPopup
        message={getContent("resubmitJoinHospitalRequestConfirmationMessage")}
        onConfirm={() => setIsLoading(true)}
        isLoading={isLoading}
      />
      <Act
        path={isLoading ? `${API}/doctor/hospitaljoin/${node._id}` : null}
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

export default ResubmitJoinHospitalRequestPopup;
