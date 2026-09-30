import { Fragment, useState } from "react";
import { IInsurance } from "@/Components/DoctorPanel/Insurance/DoctorInsurancesTab";
import classes from "./RemoveUserFromInsurancePopup.module.css";
import usePopup from "@/Components/Hooks/usePopup";
import ConfirmationPopup from "../UI/ConfirmationPopup";
import Act from "@/Components/UI/Act";
import { API } from "@/Components/config";
import { ta } from "@/Components/Admin/i18n/adminText";

const RemoveUserFromInsurancePopup = ({
  mutate,
  node,
}: {
  node: IInsurance;
  mutate: () => unknown;
}) => {
  const [isLoading, setIsLoading] = useState<boolean>();
  const { closePopup } = usePopup();
  return (
    <Fragment>
      <ConfirmationPopup
        message={ta("آیا از حذف این یوزر از روی این بیمه مطمئنید؟")}
        isLoading={isLoading}
        onConfirm={() => setIsLoading(true)}
      />
      <Act
        path={isLoading ? `${API}/admin/insurance/${node._id}` : null}
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

export default RemoveUserFromInsurancePopup;
