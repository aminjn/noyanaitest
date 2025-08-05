import { Fragment, useState } from "react";
import { IClinic } from "./AdminManageClinicsPage";
import classes from "./RemoveUserFromClinicPopup.module.css";
import usePopup from "@/Components/Hooks/usePopup";
import ConfirmationPopup from "../UI/ConfirmationPopup";
import Act from "@/Components/UI/Act";
import { API } from "@/Components/config";

const RemoveUserFromClinicPopup = ({
  mutate,
  node,
}: {
  node: IClinic;
  mutate: () => unknown;
}) => {
  const [isLoading, setIsLoading] = useState<boolean>();
  const { closePopup } = usePopup();
  return (
    <Fragment>
      <ConfirmationPopup
        message="آیا از حذف این یوزر از روی این کلینیک مطمئنید؟"
        isLoading={isLoading}
        onConfirm={() => setIsLoading(true)}
      />
      <Act
        path={isLoading ? `${API}/admin/clinic/${node._id}` : null}
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

export default RemoveUserFromClinicPopup;
