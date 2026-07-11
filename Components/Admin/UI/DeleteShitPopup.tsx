import usePopup from "@/Components/Hooks/usePopup";
import { Fragment, useState } from "react";
import ConfirmationPopup from "./ConfirmationPopup";
import Act from "@/Components/UI/Act";
import { API } from "@/Components/config";

const DeleteShitPopup = ({
  mutate,
  nodeId,
  modelName,
}: {
  nodeId: string;
  mutate: () => unknown;
  modelName: string;
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { closePopup } = usePopup();
  return (
    <Fragment>
      <ConfirmationPopup
        message="آیا از حذف این مورد مطمئنید؟"
        isLoading={isLoading}
        onConfirm={() => setIsLoading(true)}
      />
      <Act
        path={isLoading ? `${API}/auto/${modelName}/${nodeId}` : null}
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

export default DeleteShitPopup;
