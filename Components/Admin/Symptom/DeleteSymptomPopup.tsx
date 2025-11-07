import usePopup from "@/Components/Hooks/usePopup";
import { Fragment, useState } from "react";
import { ISymptom } from "../Disease/AdminManageDiseasesPage";
import { mutate } from "swr";
import ConfirmationPopup from "../UI/ConfirmationPopup";
import Act from "@/Components/UI/Act";
import { API } from "@/Components/config";

const DeleteSymptomPopup = ({
  mutate,
  node,
}: {
  node: ISymptom;
  mutate: () => unknown;
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { closePopup } = usePopup();
  return (
    <Fragment>
      <ConfirmationPopup
        message={`آیا از حذف علامت ${node.name || node._id} مطمئنید؟`}
        isLoading={isLoading}
        onConfirm={() => setIsLoading(true)}
      />
      <Act
        path={isLoading ? `${API}/auto/symptom/${node._id}` : null}
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

export default DeleteSymptomPopup;
