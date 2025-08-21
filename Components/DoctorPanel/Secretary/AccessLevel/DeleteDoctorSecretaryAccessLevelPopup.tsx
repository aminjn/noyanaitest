import { IDoctorSecretaryAccessLevel } from "@/Components/Admin/DoctorSecretaryAccessLevel/AdminManageDoctorSecretaryAccessLevelsPage";
import classes from "./DeleteDoctorSecretaryAccessLevelPopup.module.css";
import { Fragment, useState } from "react";
import usePopup from "@/Components/Hooks/usePopup";
import ConfirmationPopup from "@/Components/Admin/UI/ConfirmationPopup";
import Act from "@/Components/UI/Act";
import useLocale from "@/Components/Hooks/useLocale";
import { API } from "@/Components/config";

const DeleteDoctorSecretaryAccessLevelPopup = ({
  mutate,
  node,
}: {
  mutate: () => unknown;
  node: IDoctorSecretaryAccessLevel;
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { closePopup } = usePopup();

  const getContent = useLocale();

  return (
    <Fragment>
      <ConfirmationPopup
        onConfirm={() => setIsLoading(true)}
        isLoading={isLoading}
        message={getContent(
          "deleteDoctorSecretaryAccessLevelConfirmationMessage"
        )}
      />
      <Act
        path={isLoading ? `${API}/doctor/accesslevel/${node._id}` : null}
        onDone={(status) => {
          setIsLoading(false);
          if (!status) return;
          mutate();
          closePopup();
        }}
        method="PUT"
      />
    </Fragment>
  );
};

export default DeleteDoctorSecretaryAccessLevelPopup;
