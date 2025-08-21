import { IDoctorSecretary } from "@/Components/DoctorPanel/Secretary/Request/CreateDoctorSecretaryRequestPopup";
import classes from "./LeaveDoctorPopup.module.css";
import { mutate } from "swr";
import { Fragment, useState } from "react";
import usePopup from "@/Components/Hooks/usePopup";
import ConfirmationPopup from "@/Components/Admin/UI/ConfirmationPopup";
import Act from "@/Components/UI/Act";
import useLocale from "@/Components/Hooks/useLocale";
import { API } from "@/Components/config";

const LeaveDoctorPopup = ({
  mutate,
  node,
}: {
  node: IDoctorSecretary;
  mutate: () => unknown;
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { closePopup } = usePopup();

  const getContent = useLocale();

  return (
    <Fragment>
      <ConfirmationPopup
        isLoading={isLoading}
        message={getContent("leaveDoctorConfirmationMessage")}
        onConfirm={() => setIsLoading(true)}
      />
      <Act
        path={isLoading ? `${API}/secretary/doctor/${node._id}` : null}
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

export default LeaveDoctorPopup;
