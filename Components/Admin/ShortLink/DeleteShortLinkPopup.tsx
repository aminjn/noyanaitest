import usePopup from "@/Components/Hooks/usePopup";
import { IShortLink } from "./AdminManageShortLinksPage";
import { Fragment, useState } from "react";
import ConfirmationPopup from "../UI/ConfirmationPopup";
import Act from "@/Components/UI/Act";
import { API } from "@/Components/config";
import { ta } from "@/Components/Admin/i18n/adminText";

const DeletShortLinkPopup = ({
  mutate,
  node,
}: {
  node: IShortLink;
  mutate: () => unknown;
}) => {
  const { closePopup } = usePopup();
  const [isLoading, setIsLoading] = useState(false);
  return (
    <Fragment>
      <ConfirmationPopup
        message={ta("ایا از حذف این آیتم مطمئنید؟")}
        onConfirm={() => setIsLoading(true)}
        isLoading={isLoading}
      />
      <Act
        path={isLoading ? `${API}/auto/shortlink/${node._id}` : null}
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

export default DeletShortLinkPopup;
