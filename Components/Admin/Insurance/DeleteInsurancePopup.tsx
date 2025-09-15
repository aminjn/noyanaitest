import { IInsurance } from "@/Components/DoctorPanel/Insurance/DoctorInsurancesTab";
import usePopup from "@/Components/Hooks/usePopup";
import { Fragment, useState } from "react";
import { mutate } from "swr";
import ConfirmationPopup from "../UI/ConfirmationPopup";
import Act from "@/Components/UI/Act";
import { API } from "@/Components/config";

const DeleteInsurancePopup = ({
  mutate,
  node,
}: {
  node: IInsurance;
  mutate: () => unknown;
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { closePopup } = usePopup();
  return (
    <Fragment>
      <ConfirmationPopup
        message={`آیا از حذف بیمه ${node.name || node._id} مطمئن هستید؟`}
        isLoading={isLoading}
        onConfirm={() => setIsLoading(true)}
      />
      <Act
        path={isLoading ? `${API}/auto/insurance/${node._id}` : null}
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

export default DeleteInsurancePopup;
