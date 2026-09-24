import { Fragment, useState } from "react";
import { IDoctorSocialMedia } from "./DoctorManageSocialMediaTab";
import usePopup from "@/Components/Hooks/usePopup";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import ConfirmationPopup from "@/Components/Admin/UI/ConfirmationPopup";
import Act from "@/Components/UI/Act";
import { API } from "@/Components/config";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const NS: ContentNamespace[] = ["common", "doctorPanelProfile"];

const DeleteDoctorSocialMediaPopup = ({
  mutate,
  node,
}: {
  node: IDoctorSocialMedia;
  mutate: () => unknown;
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { closePopup } = usePopup();
  const getContent = useScopedLocale(NS);
  return (
    <Fragment>
      <ConfirmationPopup
        isLoading={isLoading}
        message={getContent("sureDeleteSocialMediaMessage")}
        onConfirm={() => setIsLoading(true)}
      />
      <Act
        path={isLoading ? `${API}/doctor/social/${node._id}` : null}
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

export default DeleteDoctorSocialMediaPopup;
