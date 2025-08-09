import { IClinicDoctor } from "@/Components/Admin/Clinic/AdminManageClinicsPage";
import classes from "./UnjoinClinicPopup.module.css";
import { Fragment, useState } from "react";
import useLocale from "@/Components/Hooks/useLocale";
import ConfirmationPopup from "@/Components/Admin/UI/ConfirmationPopup";
import Act from "@/Components/UI/Act";
import { API } from "@/Components/config";
import usePopup from "@/Components/Hooks/usePopup";

const UnjoinClinicPopup = ({
  mutate,
  node,
}: {
  node: IClinicDoctor;
  mutate: () => unknown;
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const getContent = useLocale();

  const { closePopup } = usePopup();

  return (
    <Fragment>
      <ConfirmationPopup
        message={getContent("leaveClinicConfirmationMessage")}
        isLoading={isLoading}
        onConfirm={() => setIsLoading(true)}
      />
      <Act
        path={isLoading ? `${API}/doctor/clinic/${node._id}` : null}
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

export default UnjoinClinicPopup;
