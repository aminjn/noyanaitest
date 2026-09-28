import { Fragment, useState } from "react";
import usePopup from "@/Components/Hooks/usePopup";
import ConfirmationPopup from "@/Components/Admin/UI/ConfirmationPopup";
import Act from "@/Components/UI/Act";
import { API } from "@/Components/config";
import { NodeWithAcl } from "../Request/CreateSecretaryRequestPopup";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const LOCALE_NS: ContentNamespace[] = ["common", "secretaryManager"];

// DELETE /acl/:name/secretaryrequest/:id withdraws a pending invite
const CancelSecretaryRequestPopup = ({
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
        message={getContent("smCancelInviteAsk")}
      />
      <Act
        path={isLoading ? `${API}/acl/${name}/secretaryrequest/${nodeId}` : null}
        method="DELETE"
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

export default CancelSecretaryRequestPopup;
