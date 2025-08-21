import { Fragment, useState } from "react";
import { IDoctorSecretary } from "../Request/CreateDoctorSecretaryRequestPopup";
import classes from "./DoctorDeleteSecretaryPopup.module.css";
import usePopup from "@/Components/Hooks/usePopup";
import useLocale from "@/Components/Hooks/useLocale";
import ConfirmationPopup from "@/Components/Admin/UI/ConfirmationPopup";
import Act from "@/Components/UI/Act";
import { API } from "@/Components/config";

const DoctorDeleteSecretaryPopup = ({
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
        message={getContent("deleteSecretaryConfirmationMessage")}
        isLoading={isLoading}
        onConfirm={() => setIsLoading(true)}
      />
      <Act
        path={isLoading ? `${API}/doctor/secretary/${node._id}` : null}
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

export default DoctorDeleteSecretaryPopup;
