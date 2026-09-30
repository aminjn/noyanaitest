import { Fragment, useState } from "react";
import { IDrug } from "../Disease/AdminManageDiseasesPage";
import usePopup from "@/Components/Hooks/usePopup";
import ConfirmationPopup from "../UI/ConfirmationPopup";
import Act from "@/Components/UI/Act";
import { API } from "@/Components/config";
import { ta } from "@/Components/Admin/i18n/adminText";

const DeleteDrugPopup = ({
  mutate,
  node,
}: {
  node: IDrug;
  mutate: () => unknown;
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { closePopup } = usePopup();

  return (
    <Fragment>
      <ConfirmationPopup
        message={ta("آیا از حذف دارو ${1} مطمئنید؟", [node.name || node._id])}
        isLoading={isLoading}
        onConfirm={() => setIsLoading(true)}
      />
      <Act
        path={isLoading ? `${API}/auto/drug/${node._id}` : null}
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

export default DeleteDrugPopup;
