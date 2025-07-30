import { Fragment, useState } from "react";
import ConfirmationPopup from "../../UI/ConfirmationPopup";
import classes from "./DropDoctorsPoppup.module.css";
import Act from "@/Components/UI/Act";
import { API } from "@/Components/config";
import usePopup from "@/Components/Hooks/usePopup";

const DropDoctorsPoppup = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { closePopup } = usePopup();
  return (
    <Fragment>
      <ConfirmationPopup
        isLoading={isLoading}
        onConfirm={() => setIsLoading(true)}
        message="آیا از انداختن پزشکان مطمئنید؟"
      />
      <Act
        path={isLoading ? `${API}/migrate/doctor` : null}
        method="PUT"
        onDone={(status) => {
          setIsLoading(false);
          if (!status) return;
          closePopup();
        }}
      />
    </Fragment>
  );
};

export default DropDoctorsPoppup;
