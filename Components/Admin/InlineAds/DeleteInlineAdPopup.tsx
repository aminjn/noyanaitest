import { Fragment, useState } from "react";
import ConfirmationPopup from "../UI/ConfirmationPopup";
import { IInlineAdvertisement } from "./AdminManageInlineAdsPage";
import classes from "./DeleteInlineAdPopup.module.css";
import Act from "@/Components/UI/Act";
import { API } from "@/Components/config";
import usePopup from "@/Components/Hooks/usePopup";

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
        message={`آیا از حذف تبلیغات ${node.name} مطمئنید؟`}
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
