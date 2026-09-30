import { Fragment, useState } from "react";
import classes from "./DeleteClinicAdditionRequestPopup.module.css";
import usePopup from "@/Components/Hooks/usePopup";
import { IClinicAdditionRequest } from "@/Components/DoctorPanel/Clinic/DoctorClinicAdditionsTab";
import ConfirmationPopup from "../UI/ConfirmationPopup";
import Act from "@/Components/UI/Act";
import { API } from "@/Components/config";
import { ta } from "@/Components/Admin/i18n/adminText";

const DeleteClinicAdditionRequestPopup = ({
  mutate,
  node,
}: {
  node: IClinicAdditionRequest;
  mutate: () => unknown;
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { closePopup } = usePopup();
  return (
    <Fragment>
      <ConfirmationPopup
        isLoading={isLoading}
        onConfirm={() => setIsLoading(true)}
        message={ta("آیا از حذف این درخواست به طور کامل اطمینان دارید؟")}
      />
      <Act
        path={isLoading ? `${API}/auto/clinicaddition/${node._id}` : null}
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

export default DeleteClinicAdditionRequestPopup;
