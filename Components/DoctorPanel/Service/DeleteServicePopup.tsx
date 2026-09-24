import { Fragment, useState } from "react";
import { IService } from "./DoctorManageServicesPage";
import usePopup from "@/Components/Hooks/usePopup";
import ConfirmationPopup from "@/Components/Admin/UI/ConfirmationPopup";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import Act from "@/Components/UI/Act";
import { API } from "@/Components/config";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const NS: ContentNamespace[] = ["common", "doctorPanelService"];

const DeleteServicePopup = ({
  mutate,
  node,
}: {
  node: IService;
  mutate: () => unknown;
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { closePopup } = usePopup();

  const getContent = useScopedLocale(NS);

  return (
    <Fragment>
      <ConfirmationPopup
        message={getContent("sureDeleteService")}
        isLoading={isLoading}
        onConfirm={() => setIsLoading(true)}
      />
      <Act
        path={isLoading ? `${API}/doctor/service/${node._id}` : null}
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

export default DeleteServicePopup;
