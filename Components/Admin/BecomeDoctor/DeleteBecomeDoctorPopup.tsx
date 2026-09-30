import { IBecomeDoctorRequest } from "@/Components/DoctorPanel/DoctorPanelPage";
import classes from "./DeleteBecomeDoctorPopup.module.css";
import ConfirmationPopup from "../UI/ConfirmationPopup";
import { Fragment, useState } from "react";
import usePopup from "@/Components/Hooks/usePopup";
import Act from "@/Components/UI/Act";
import { API } from "@/Components/config";
import { ta } from "@/Components/Admin/i18n/adminText";

const DeleteBecomeDoctorPopup = ({
  mutate,
  node,
}: {
  node: IBecomeDoctorRequest;
  mutate: () => unknown;
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { closePopup } = usePopup();

  return (
    <Fragment>
      <ConfirmationPopup
        message={ta("آیا از حذف این درخواست مطمئنید؟")}
        onConfirm={() => setIsLoading(true)}
        isLoading={isLoading}
      />
      <Act
        path={isLoading ? `${API}/auto/becomedoctor/${node._id}` : null}
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

export default DeleteBecomeDoctorPopup;
