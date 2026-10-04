import { mutate } from "swr";
import { IAccessLevel } from "./AdminManageAccessLevelsPage";
import classes from "./DeleteAccessLevelPopup.module.css";
import { Fragment, useState } from "react";
import usePopup from "@/Components/Hooks/usePopup";
import ConfirmationPopup from "../UI/ConfirmationPopup";
import Act from "@/Components/UI/Act";
import { API } from "@/Components/config";
import { ta } from "@/Components/Admin/i18n/adminText";

// Deleting a role demotes every staff member on it to a plain user
// (backend Models/AccessLevel.ts): the confirmation says so.
const DeleteAccessLevelPopup = ({
  node,
  mutate,
}: {
  node: IAccessLevel;
  mutate: () => unknown;
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { closePopup } = usePopup();
  return (
    <Fragment>
      <ConfirmationPopup
        message={ta("سطح دسترسی ${1} حذف شود؟ کارکنانی که این نقش را دارند کاربر عادی می‌شوند و دسترسی‌شان به پنل مدیریت قطع می‌شود.", [node.name || ta("بدون نام")])}
        isLoading={isLoading}
        onConfirm={() => setIsLoading(true)}
      />
      <Act
        path={isLoading ? `${API}/auto/accesslevel/${node._id}` : null}
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

export default DeleteAccessLevelPopup;
