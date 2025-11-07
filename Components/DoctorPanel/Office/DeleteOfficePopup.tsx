import { Fragment, useState } from "react";
import { IOffice } from "./DoctorManageOfficesPage";
import usePopup from "@/Components/Hooks/usePopup";
import ConfirmationPopup from "@/Components/Admin/UI/ConfirmationPopup";
import useLocale from "@/Components/Hooks/useLocale";
import Act from "@/Components/UI/Act";
import { API } from "@/Components/config";

const DeleteOfficePopup = ({
  mutate,
  node,
}: {
  node: IOffice;
  mutate: () => unknown;
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { closePopup } = usePopup();

  const getContent = useLocale();

  return (
    <Fragment>
      <ConfirmationPopup
        message={getContent("sureDeleteOffice")}
        isLoading={isLoading}
        onConfirm={() => setIsLoading(true)}
      />
      <Act
        path={isLoading ? `${API}/doctor/office/${node._id}` : null}
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

export default DeleteOfficePopup;
