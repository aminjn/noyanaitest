import { Fragment, useState } from "react";
import usePopup from "@/Components/Hooks/usePopup";
import ConfirmationPopup from "@/Components/Admin/UI/ConfirmationPopup";
import Act from "@/Components/UI/Act";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { API } from "@/Components/config";
import {
  ISecretary,
  NodeWithAcl,
  SecretaryNodePath,
} from "../_Common/SecretaryManager/Request/CreateSecretaryRequestPopup";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const NS: ContentNamespace[] = ["common", "secretaryPanelHome"];

const LeaveBossPopup = ({
  mutate,
  node,
  name,
}: {
  node: ISecretary<SecretaryNodePath>;
  mutate: () => unknown;
  name: NodeWithAcl;
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { closePopup } = usePopup();

  const getContent = useScopedLocale(NS);

  return (
    <Fragment>
      <ConfirmationPopup
        isLoading={isLoading}
        message={getContent("leaveBossConfirmationMessage")}
        onConfirm={() => setIsLoading(true)}
      />
      <Act
        path={isLoading ? `${API}/secretary/boss/${name}/${node._id}` : null}
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

export default LeaveBossPopup;
