import { Fragment, useState } from "react";
import { IClinic } from "./AdminManageClinicsPage";
import classes from "./DeleteClinicPopup.module.css";
import usePopup from "@/Components/Hooks/usePopup";
import ConfirmationPopup from "../UI/ConfirmationPopup";
import Act from "@/Components/UI/Act";
import { API } from "@/Components/config";
import { ta } from "@/Components/Admin/i18n/adminText";

const DeleteClinicPopup = ({
  mutate,
  node,
}: {
  mutate: () => unknown;
  node: IClinic;
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { closePopup } = usePopup();
  return (
    <Fragment>
      <ConfirmationPopup
        isLoading={isLoading}
        message={ta("آیا از حذف کلینیک ${1} مطمئنید؟", [node.name || ta("بدون نام")])}
        onConfirm={() => setIsLoading(true)}
      />
      <Act
        path={isLoading ? `${API}/auto/clinic/${node._id}` : null}
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

export default DeleteClinicPopup;
