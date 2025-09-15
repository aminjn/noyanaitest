import { Fragment, useState } from "react";
import { IDoctorPharmacy } from "./DoctorPharmaciesTab";
import usePopup from "@/Components/Hooks/usePopup";
import ConfirmationPopup from "@/Components/Admin/UI/ConfirmationPopup";
import useLocale from "@/Components/Hooks/useLocale";
import Act from "@/Components/UI/Act";
import { API } from "@/Components/config";

const DeleteDoctorPharmacyPopup = ({
  mutate,
  node,
}: {
  node: IDoctorPharmacy;
  mutate: () => unknown;
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { closePopup } = usePopup();

  const getContent = useLocale();

  return (
    <Fragment>
      <ConfirmationPopup
        message={getContent("sureDeletePharmacy")}
        isLoading={isLoading}
        onConfirm={() => setIsLoading(true)}
      />
      <Act
        path={isLoading ? `${API}/doctor/pharmacy/${node._id}` : null}
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

export default DeleteDoctorPharmacyPopup;
