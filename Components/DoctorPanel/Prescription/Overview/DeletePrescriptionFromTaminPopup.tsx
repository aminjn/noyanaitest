import { Fragment, useState } from "react";
import { IPrescription } from "../Create/PrescriptionItemsOverview";
import usePopup from "@/Components/Hooks/usePopup";
import ConfirmationPopup from "@/Components/Admin/UI/ConfirmationPopup";
import useLocale from "@/Components/Hooks/useLocale";
import Act from "@/Components/UI/Act";
import { API } from "@/Components/config";

const DeletePrescriptionFromTaminPopup = ({
  node,
}: {
  node: IPrescription;
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const getContent = useLocale();

  const { closePopup } = usePopup();

  return (
    <Fragment>
      <ConfirmationPopup
        isLoading={isLoading}
        message={getContent("sureDeletePrescriptionFromTaminMessage")}
        onConfirm={() => {
          setIsLoading(true);
        }}
      />
      <Act
        path={isLoading ? `${API}/doctor/presc/tamin/${node._id}` : null}
        method="PUT"
        onDone={(status) => {
          setIsLoading(false);
          if (!status) return;
          closePopup();
        }}
      />
    </Fragment>
  );
};

export default DeletePrescriptionFromTaminPopup;
