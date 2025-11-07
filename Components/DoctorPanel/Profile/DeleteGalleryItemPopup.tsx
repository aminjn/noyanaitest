import { IGalleryItem } from "@/Components/Admin/Doctor/AdminManageDoctorGalleryTab";
import ConfirmationPopup from "@/Components/Admin/UI/ConfirmationPopup";
import { API } from "@/Components/config";
import useLocale from "@/Components/Hooks/useLocale";
import usePopup from "@/Components/Hooks/usePopup";
import Act from "@/Components/UI/Act";
import { Fragment, useState } from "react";

const DeleteGalleryItemPopup = ({
  mutate,
  node,
}: {
  node: IGalleryItem;
  mutate: () => unknown;
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const getContent = useLocale();
  const { closePopup } = usePopup();

  return (
    <Fragment>
      <ConfirmationPopup
        message={getContent("sureDeleteGalleryItem")}
        onConfirm={() => setIsLoading(true)}
        isLoading={isLoading}
      />
      <Act
        path={isLoading ? `${API}/doctor/gallery/${node._id}` : null}
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
