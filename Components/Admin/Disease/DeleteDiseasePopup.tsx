import { Fragment, useState } from "react";
import { mutate } from "swr";
import ConfirmationPopup from "../UI/ConfirmationPopup";
import Act from "@/Components/UI/Act";
import { API } from "@/Components/config";
import usePopup from "@/Components/Hooks/usePopup";
import { IDisease } from "./AdminManageDiseasesPage";
import { ta } from "@/Components/Admin/i18n/adminText";

const DeleteDiseasePopup = ({
  mutate,
  node,
}: {
  node: IDisease;
  mutate: () => unknown;
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { closePopup } = usePopup();

  return (
    <Fragment>
      <ConfirmationPopup
        message={ta("آیا از حذف بیماری ${1} مطمئنید؟", [node.name || node._id])}
        isLoading={isLoading}
        onConfirm={() => setIsLoading(true)}
      />
      <Act
        path={isLoading ? `${API}/auto/disease/${node._id}` : null}
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

export default DeleteDiseasePopup;
