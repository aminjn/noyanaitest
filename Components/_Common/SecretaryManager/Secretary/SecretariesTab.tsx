import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import Table from "@/Components/Admin/UI/Table";
import TableActions from "@/Components/Admin/UI/TableActions";
import EditIcon from "@/Components/Icons/EditIcon";
import IconButton from "@/Components/Admin/UI/IconButton";
import GarbageIcon from "@/Components/Icons/GarbageIcon";
import usePopup from "@/Components/Hooks/usePopup";
import {
  ISecretary,
  NodeWithAcl,
  SecretaryNodePath,
} from "../Request/CreateSecretaryRequestPopup";
import MutateSecretaryPopup from "./MutateSecretaryPopup";
import RemoveSecretaryPopup from "./RemoveSecretaryPopup";
import CreateSecretaryRequestPopup from "../Request/CreateSecretaryRequestPopup";
import TableBox from "@/Components/UI/TableBox";
import Button from "@/Components/UI/Button";
import { mutate as globalMutate } from "swr";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const LOCALE_NS: ContentNamespace[] = ["common", "secretaryManager"];

const SecretariesTab = ({ name }: { name: NodeWithAcl }) => {
  const { data, error, mutate } = useSWR<
    ISecretary<SecretaryNodePath, { Acl: true; Secretary: true }>[]
  >(`${API}/acl/${name}/secretary`, (url: string) =>
    fetcher({ url }).then((res) => res.data),
  );

  const getContent = useScopedLocale(LOCALE_NS);

  const { setPopup } = usePopup();

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <TableBox
          title={getContent("secretaries")}
          actions={[
            {
              id: "InviteSecretary",
              content: (
                <Button
                  onClick={() =>
                    setPopup(
                      "CreateSecretaryRequestPopup",
                      <CreateSecretaryRequestPopup
                        name={name}
                        mutate={() =>
                          globalMutate(`${API}/acl/${name}/secretaryrequest`)
                        }
                      />,
                    )
                  }
                >
                  {getContent("smInvite")}
                </Button>
              ),
            },
          ]}
        >
          {!Array.isArray(data) || !data.length ? (
            <p
              style={{
                padding: "1.5rem 0",
                color: "var(--gray9)",
                lineHeight: 2,
              }}
            >
              {getContent("smNoSecretary")}
            </p>
          ) : (
            <Table
              data={data}
              name="ManageSecretaries"
              renderer={{
                displayName: {
                  name: getContent("displayName"),
                  value: (node) => node.displayName,
                  filter: "Text",
                },
                secretary: {
                  name: getContent("phone"),
                  filter: "Text",
                  value: (node) => node.secretary?.phone,
                },
                accessLevel: {
                  name: getContent("accessLevel"),
                  filter: "Multi",
                  value: (node) =>
                    node.acl ? node.acl.name : getContent("notAssigned"),
                },
                action: {
                  name: getContent("actions"),
                  component: (node) => (
                    <TableActions>
                      <IconButton
                        variant="Info"
                        onClick={() =>
                          setPopup(
                            "DoctorMutateSecretary",
                            <MutateSecretaryPopup
                              name={name}
                              mutate={mutate}
                              node={node}
                            />,
                          )
                        }
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        variant="Danger"
                        title={getContent("smRemove")}
                        onClick={() =>
                          setPopup(
                            "RemoveSecretary",
                            <RemoveSecretaryPopup
                              mutate={mutate}
                              nodeId={node._id}
                              name={name}
                            />,
                          )
                        }
                      >
                        <GarbageIcon />
                      </IconButton>
                    </TableActions>
                  ),
                },
              }}
            />
          )}
        </TableBox>
      )}
    </HandleLoading>
  );
};

export default SecretariesTab;
