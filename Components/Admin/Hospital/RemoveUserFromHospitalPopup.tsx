import { Fragment, useState } from "react";
import { IHospital } from "./AdminManageHospitalsPage";
import classes from "./RemoveUserFromHospitalPopup.module.css";
import usePopup from "@/Components/Hooks/usePopup";
import ConfirmationPopup from "../UI/ConfirmationPopup";
import Act from "@/Components/UI/Act";
import { API } from "@/Components/config";

const RemoveUserFromHospitalPopup = ({
  mutate,
  node,
}: {
  node: IHospital;
  mutate: () => unknown;
}) => {
  const [isLoading, setIsLoading] = useState<boolean>();
  const { closePopup } = usePopup();
  return (
    <Fragment>
      <ConfirmationPopup
        message="آیا از حذف این یوزر از روی این بیمارستان مطمئنید؟"
        isLoading={isLoading}
        onConfirm={() => setIsLoading(true)}
      />
      <Act
        path={isLoading ? `${API}/admin/hospital/${node._id}` : null}
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

export default RemoveUserFromHospitalPopup;
