import { Fragment, useState } from "react";
import { IPrescription } from "../Create/PrescriptionItemsOverview";
import usePopup from "@/Components/Hooks/usePopup";
import ConfirmationPopup from "@/Components/Admin/UI/ConfirmationPopup";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import Act from "@/Components/UI/Act";
import { API } from "@/Components/config";

const LOCALE_NS: ContentNamespace[] = ["common", "doctorPanelPrescriptionOverview"];

const DeletePrescriptionFromTaminPopup = ({
  node,
}: {
  node: IPrescription;
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const getContent = useScopedLocale(LOCALE_NS);

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
