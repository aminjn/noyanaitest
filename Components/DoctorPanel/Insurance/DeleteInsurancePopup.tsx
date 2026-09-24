import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { IDoctorInsurance } from "./DoctorInsurancesTab";
import { Fragment, useState } from "react";
import usePopup from "@/Components/Hooks/usePopup";
import ConfirmationPopup from "@/Components/Admin/UI/ConfirmationPopup";
import Act from "@/Components/UI/Act";
import { API } from "@/Components/config";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const NS: ContentNamespace[] = ["common", "doctorPanelInsurance"];

const DeleteInsurancePopup = ({
  mutate,
  node,
}: {
  node: IDoctorInsurance;
  mutate: () => unknown;
}) => {
  const getContent = useScopedLocale(NS);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { closePopup } = usePopup();

  return (
    <Fragment>
      <ConfirmationPopup
        message={getContent("sureDeleteInsurance")}
        isLoading={isLoading}
        onConfirm={() => setIsLoading(true)}
      />
      <Act
        path={isLoading ? `${API}/doctor/insurance/${node._id}` : null}
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

export default DeleteInsurancePopup;
