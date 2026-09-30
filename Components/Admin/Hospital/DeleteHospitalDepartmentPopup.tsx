import { Fragment, useState } from "react";
import { IHospitalDepartment } from "./AdminManageHospitalsPage";
import classes from "./DeleteHospitalDepartmentPopup.module.css";
import usePopup from "@/Components/Hooks/usePopup";
import ConfirmationPopup from "../UI/ConfirmationPopup";
import Act from "@/Components/UI/Act";
import { API } from "@/Components/config";
import { ta } from "@/Components/Admin/i18n/adminText";

const DeleteHospitalDepartmentPopup = ({
  mutate,
  node,
}: {
  node: IHospitalDepartment;
  mutate: () => unknown;
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { closePopup } = usePopup();
  return (
    <Fragment>
      <ConfirmationPopup
        isLoading={isLoading}
        message={ta("آیا از حذف دپارتمان ${1} مطمئنید؟", [node.name || ta("بدون نام")])}
        onConfirm={() => setIsLoading(true)}
      />
      <Act
        path={isLoading ? `${API}/auto/hospitaldepartment/${node._id}` : null}
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

export default DeleteHospitalDepartmentPopup;
