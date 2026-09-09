import { Fragment, useState } from "react";
import { IHospitalDepartment } from "./AdminManageHospitalsPage";
import classes from "./DeleteHospitalDepartmentPopup.module.css";
import usePopup from "@/Components/Hooks/usePopup";
import ConfirmationPopup from "../UI/ConfirmationPopup";
import Act from "@/Components/UI/Act";
import { API } from "@/Components/config";

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
        message={`آیا از حذف دپارتمان ${node.name || node._id} مطمئنید؟`}
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
