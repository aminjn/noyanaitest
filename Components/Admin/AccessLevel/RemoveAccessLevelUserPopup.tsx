import { IUser } from "@/Components/Hooks/useUser";
import classes from "./RemoveAccessLevelUserPopup.module.css";
import { IUserAccessLevel } from "./AccessLevelAdminsTab";
import { Fragment, useState } from "react";
import usePopup from "@/Components/Hooks/usePopup";
import ConfirmationPopup from "../UI/ConfirmationPopup";
import Act from "@/Components/UI/Act";
import { API } from "@/Components/config";

const RemoveAccessLevelUserPopup = ({
  mutate,
  permission,
}: {
  permission: IUserAccessLevel;
  mutate: () => unknown;
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { closePopup } = usePopup();
  return (
    <Fragment>
      <ConfirmationPopup
        message={`آیا از حذف دسترسی از این یوزر مطمئنید؟`}
        isLoading={isLoading}
        onConfirm={() => setIsLoading(true)}
      />
      <Act
        path={
          isLoading ? `${API}/auto/useraccesslevel/${permission._id}` : null
        }
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

export default RemoveAccessLevelUserPopup;
