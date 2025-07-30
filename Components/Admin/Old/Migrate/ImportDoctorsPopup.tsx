import { Fragment, useState } from "react";
import ConfirmationPopup from "../../UI/ConfirmationPopup";
import classes from "./ImportDoctorsPopup.module.css";
import Act from "@/Components/UI/Act";
import { API } from "@/Components/config";
import usePopup from "@/Components/Hooks/usePopup";

const ImportDoctorsPopup = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { closePopup } = usePopup();

  return (
    <Fragment>
      <ConfirmationPopup
        message="ایا پزشکان ایمپورت شوند؟"
        isLoading={isLoading}
        onConfirm={() => setIsLoading(true)}
      />
      <Act
        path={isLoading ? `${API}/migrate/doctor` : null}
        method="POST"
        onDone={(status) => {
          setIsLoading(false);
          if (!status) return;
          closePopup();
        }}
      />
    </Fragment>
  );
};

export default ImportDoctorsPopup;
