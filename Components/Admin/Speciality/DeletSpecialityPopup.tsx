import { mutate } from "swr";
import { ISpeciality } from "./AdminManageSpecialitiesPage";
import classes from "./DeleteSpecialityPopup.module.css";
import ConfirmationPopup from "../UI/ConfirmationPopup";
import { Fragment, useState } from "react";
import Act from "@/Components/UI/Act";
import { API } from "@/Components/config";
import usePopup from "@/Components/Hooks/usePopup";

const DeleteSpecialityPopup = ({
  node,
  mutate,
}: {
  node: ISpeciality;
  mutate: () => unknown;
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { closePopup } = usePopup();

  return (
    <Fragment>
      <ConfirmationPopup
        message={`ایا از حذف از تخصص ${node.name || "بی نام"} مطمئنید؟`}
        onConfirm={() => setIsLoading(true)}
        isLoading={isLoading}
      />
      <Act
        path={isLoading ? `${API}/auto/speciality/${node._id}` : null}
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

export default DeleteSpecialityPopup;
