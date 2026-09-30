import { Fragment, useState } from "react";
import ConfirmationPopup from "../UI/ConfirmationPopup";
import { IInlineAdvertisement } from "./AdminManageInlineAdsPage";
import classes from "./DeleteInlineAdPopup.module.css";
import Act from "@/Components/UI/Act";
import { API } from "@/Components/config";
import usePopup from "@/Components/Hooks/usePopup";
import { ta } from "@/Components/Admin/i18n/adminText";

const DeleteInlineAdPopup = ({
  node,
  mutate,
}: {
  node: IInlineAdvertisement;
  mutate: () => unknown;
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { closePopup } = usePopup();
  return (
    <Fragment>
      <ConfirmationPopup
        message={ta("آیا از حذف تبلیغات ${1} مطمئنید؟", [node.name])}
        isLoading={isLoading}
        onConfirm={() => setIsLoading(true)}
      />
      <Act
        path={isLoading ? `${API}/auto/inlinead/${node._id}` : null}
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

export default DeleteInlineAdPopup;
