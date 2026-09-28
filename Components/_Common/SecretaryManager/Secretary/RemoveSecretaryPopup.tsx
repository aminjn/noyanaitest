import { Fragment, useState } from "react";
import usePopup from "@/Components/Hooks/usePopup";
import ConfirmationPopup from "@/Components/Admin/UI/ConfirmationPopup";
import Act from "@/Components/UI/Act";
import { API } from "@/Components/config";
import { NodeWithAcl } from "../Request/CreateSecretaryRequestPopup";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const LOCALE_NS: ContentNamespace[] = ["common", "secretaryManager"];

// PUT /acl/:name/secretary/:id removes the secretary from the owner's team
const RemoveSecretaryPopup = ({
  mutate,
  nodeId,
  name,
}: {
  mutate: () => unknown;
  nodeId: string;
  name: NodeWithAcl;
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { closePopup } = usePopup();
  const getContent = useScopedLocale(LOCALE_NS);

  return (
    <Fragment>
      <ConfirmationPopup
        onConfirm={() => setIsLoading(true)}
        isLoading={isLoading}
        message={getContent("smRemoveAsk")}
      />
      <Act
        path={isLoading ? `${API}/acl/${name}/secretary/${nodeId}` : null}
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

export default RemoveSecretaryPopup;
