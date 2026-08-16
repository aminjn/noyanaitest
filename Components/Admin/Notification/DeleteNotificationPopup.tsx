import usePopup from "@/Components/Hooks/usePopup";
import { Fragment, useState } from "react";
import ConfirmationPopup from "../UI/ConfirmationPopup";
import Act from "@/Components/UI/Act";
import { API } from "@/Components/config";
import { FullNotification } from "./AdminManageNotificationsPage";

const DeleteNotificationPopup = ({
  mutate,
  node,
}: {
  node: FullNotification;
  mutate: () => unknown;
}) => {
  const { closePopup } = usePopup();
  const [isLoading, setIsLoading] = useState(false);
  return (
    <Fragment>
      <ConfirmationPopup
        message="ایا از حذف این اعلان مطمئنید؟"
        onConfirm={() => setIsLoading(true)}
        isLoading={isLoading}
      />
      <Act
        path={isLoading ? `${API}/auto/notification/${node._id}` : null}
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

export default DeleteNotificationPopup;
