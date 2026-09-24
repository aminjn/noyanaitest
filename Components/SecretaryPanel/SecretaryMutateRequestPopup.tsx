import PopupCard from "@/Components/UI/PopupCard";
import usePopup from "@/Components/Hooks/usePopup";
import { API } from "@/Components/config";
import { useState } from "react";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import FormActions from "@/Components/Admin/UI/FormActions";
import Button from "@/Components/UI/Button";
import TableBox from "@/Components/UI/TableBox";
import Act from "@/Components/UI/Act";
import {
  NodeWithAcl,
  SecretaryNodePath,
} from "../_Common/SecretaryManager/Request/CreateSecretaryRequestPopup";
import {
  ISecretaryRequest,
  SecretaryRequestStatus,
} from "../_Common/SecretaryManager/Request/SecretaryRequestsTab";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const NS: ContentNamespace[] = ["common", "secretaryPanelHome"];

const SecretaryMutateRequestPopup = ({
  mutate,
  node,
  name,
}: {
  mutate: () => unknown;
  node: ISecretaryRequest<SecretaryNodePath>;
  name: NodeWithAcl;
}) => {
  const { closePopup } = usePopup();
  const [isLoading, setIsLoading] = useState<SecretaryRequestStatus | null>(
    null
  );

  const getContent = useScopedLocale(NS);

  return (
    <PopupCard>
      <TableBox title={getContent("secretaryDecideSecretaryRequestStatus")}>
        <FormActions>
          <Button
            onClick={() => {
              if (isLoading) return;
              setIsLoading("Approved");
            }}
            isLoading={isLoading === "Approved"}
          >
            {getContent("approve")}
          </Button>
          <Button
            variant="Error"
            onClick={() => {
              if (isLoading) return;
              setIsLoading("Rejected");
            }}
            isLoading={isLoading === "Rejected"}
          >
            {getContent("reject")}
          </Button>
        </FormActions>
      </TableBox>
      <Act
        path={
          !!isLoading ? `${API}/secretary/request/${name}/${node._id}` : null
        }
        method="POST"
        onDone={(status) => {
          setIsLoading(null);
          if (!status) return;
          mutate();
          closePopup();
        }}
        payload={{ status: isLoading }}
      />
    </PopupCard>
  );
};

export default SecretaryMutateRequestPopup;
