import { Fragment, useState } from "react";
import usePopup from "@/Components/Hooks/usePopup";
import ConfirmationPopup from "@/Components/Admin/UI/ConfirmationPopup";
import Act from "@/Components/UI/Act";
import useLocale from "@/Components/Hooks/useLocale";
import { API } from "@/Components/config";
import { Acl, NodeWithAcl } from "../Request/CreateSecretaryRequestPopup";

const DeleteSecretaryAccessLevelPopup = ({
  mutate,
  node,
  name,
}: {
  mutate: () => unknown;
  node: Acl<string[], unknown>;
  name: NodeWithAcl;
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { closePopup } = usePopup();

  const getContent = useLocale();

  return (
    <Fragment>
      <ConfirmationPopup
        onConfirm={() => setIsLoading(true)}
        isLoading={isLoading}
        message={getContent("deleteSecretaryAccessLevelConfirmationMessage")}
      />
      <Act
        path={isLoading ? `${API}/acl/${name}/acl/${node._id}` : null}
        onDone={(status) => {
          setIsLoading(false);
          if (!status) return;
          mutate();
          closePopup();
        }}
        method="PUT"
      />
    </Fragment>
  );
};

export default DeleteSecretaryAccessLevelPopup;
