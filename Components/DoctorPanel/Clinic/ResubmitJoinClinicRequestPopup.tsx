import { Fragment, useState } from "react";
import classes from "./ResubmitJoinClinicRequestPopup.module.css";
import { IDoctorJoinClinicRequest } from "./DoctorJoinClinicsTab";
import usePopup from "@/Components/Hooks/usePopup";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import ConfirmationPopup from "@/Components/Admin/UI/ConfirmationPopup";
import Act from "@/Components/UI/Act";
import { API } from "@/Components/config";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const NS: ContentNamespace[] = ["common", "doctorPanelClinic"];

const ResubmitJoinClinicRequestPopup = ({
  node,
  mutate,
}: {
  node: IDoctorJoinClinicRequest;
  mutate: () => unknown;
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { closePopup } = usePopup();
  const getContent = useScopedLocale(NS);
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
