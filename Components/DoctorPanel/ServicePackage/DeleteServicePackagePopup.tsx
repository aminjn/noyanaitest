import { Fragment, useState } from "react";
import { IServicePackage } from "./DoctorManageServicePackagesPage";
import usePopup from "@/Components/Hooks/usePopup";
import ConfirmationPopup from "@/Components/Admin/UI/ConfirmationPopup";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import Act from "@/Components/UI/Act";
import { API } from "@/Components/config";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const NS: ContentNamespace[] = ["common", "doctorPanelServicePackage"];

const DeleteServicePackagePopup = ({
  mutate,
  node,
}: {
  node: IServicePackage;
  mutate: () => unknown;
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { closePopup } = usePopup();

  const getContent = useScopedLocale(NS);

  return (
    <Fragment>
      <ConfirmationPopup
        message={getContent("sureDeleteServicePackage")}
        isLoading={isLoading}
        onConfirm={() => setIsLoading(true)}
      />
      <Act
        path={isLoading ? `${API}/doctor/servicepackage/${node._id}` : null}
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

export default DeleteServicePackagePopup;
