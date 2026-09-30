import { Fragment, useState } from "react";
import { IGalleryItem } from "./AdminManageDoctorGalleryTab";
import classes from "./DeleteGalleryItemPopup.module.css";
import ConfirmationPopup from "../UI/ConfirmationPopup";
import usePopup from "@/Components/Hooks/usePopup";
import Act from "@/Components/UI/Act";
import { API } from "@/Components/config";
import { ta } from "@/Components/Admin/i18n/adminText";

const DeleteGalleryItemPopup = ({
  mutate,
  node,
}: {
  node: IGalleryItem;
  mutate: () => unknown;
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { closePopup } = usePopup();
  return (
    <Fragment>
      <ConfirmationPopup
        message={ta("آیا از حذف این تصویر مطمئنید؟")}
        isLoading={isLoading}
        onConfirm={() => setIsLoading(true)}
      />
      <Act
        path={isLoading ? `${API}/auto/galleryitem/${node._id}` : null}
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

export default DeleteGalleryItemPopup;
