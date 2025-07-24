import { IDoctorProfile } from "@/Components/DoctorPanel/DoctorPanelPage";
import classes from "./DeleteDoctorProfilePopup.module.css";
import { Fragment, useState } from "react";
import usePopup from "@/Components/Hooks/usePopup";
import ConfirmationPopup from "../UI/ConfirmationPopup";
import Act from "@/Components/UI/Act";
import { API } from "@/Components/config";

const DeleteDoctorProfilePopup = ({
  mutate,
  node,
}: {
  node: IDoctorProfile;
  mutate: () => unknown;
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { closePopup } = usePopup();
  return (
    <Fragment>
      <ConfirmationPopup
        message={`آیا از حذف پروفایل پزشک ${node.firstName || ""} ${
          node.lastName || ""
        } مطمئنید؟`}
        isLoading={isLoading}
        onConfirm={() => setIsLoading(true)}
      />
      <Act
        path={isLoading ? `${API}/auto/doctorprofile/${node._id}` : null}
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

export default DeleteDoctorProfilePopup;
