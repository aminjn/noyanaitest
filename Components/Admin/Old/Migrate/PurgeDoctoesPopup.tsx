import { Fragment, useState } from "react";
import classes from "./PurgeDoctorsPopup.module.css";
import usePopup from "@/Components/Hooks/usePopup";
import ConfirmationPopup from "../../UI/ConfirmationPopup";
import Act from "@/Components/UI/Act";
import { API } from "@/Components/config";

const PurgeDoctorsPopup = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { closePopup } = usePopup();
  return (
    <Fragment>
      <ConfirmationPopup
        onConfirm={() => setIsLoading(true)}
        message="ایا از قطع اتصال پزشکان ساخته شده جدید با دیتابیس قدیم مطمئنید؟"
        isLoading={isLoading}
      />
      <Act
        path={isLoading ? `${API}/migrate/doctor` : null}
        method="PATCH"
        onDone={(status) => {
          setIsLoading(false);
          if (!status) return;
          closePopup();
        }}
      />
    </Fragment>
  );
};

export default PurgeDoctorsPopup;
