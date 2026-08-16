import TableBox from "@/Components/UI/TableBox";
import useLocale from "@/Components/Hooks/useLocale";
import Table from "@/Components/Admin/UI/Table";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import useSWR from "swr";
import { API } from "@/Components/config";
import { MongoDoc } from "@/Components/Hooks/useUser";
import { Population } from "@/Components/Admin/Clinic/AdminManageClinicsPage";
import { fetcher } from "@/Components/helpers/fetcher";
import FormatDate from "@/Components/UI/FormatDate";
import TableActions from "@/Components/Admin/UI/TableActions";
import IconButton from "@/Components/Admin/UI/IconButton";
import EditIcon from "@/Components/Icons/EditIcon";
import usePopup from "@/Components/Hooks/usePopup";
import Button from "@/Components/UI/Button";
import CreateSecretaryRequestPopup, {
  ModelNameToAclModel,
  modelNameToAclName,
  ModelNameToModelType,
  NodeWithAcl,
  SecretaryNodePath,
} from "./CreateSecretaryRequestPopup";
import EditSecretaryRequestPopup from "./EditSecretaryRequestPopup";

export const secretaryRequestStatuses = [
  "Pending",
  "Approved",
  "Rejected",
] as const;

export type SecretaryRequestStatus = (typeof secretaryRequestStatuses)[number];

export type SecretaryRequestPopulation = Population<{ Owner: true; Acl: true }>;
export interface ISecretaryRequest<
  T extends SecretaryNodePath,
  K extends SecretaryRequestPopulation = SecretaryRequestPopulation
> extends MongoDoc {
  submittedAt: Date;
  owner: K["Owner"] extends true ? ModelNameToModelType[T] : string;
  acl?: K["Acl"] extends true ? ModelNameToAclModel[T] : string;
  ownerPath: T;
  aclPath: (typeof modelNameToAclName)[T];
  phone: string;
  status: SecretaryRequestStatus;
  displayName?: string;
  message?: string;
}

const SecretaryRequestsTab = ({ name }: { name: NodeWithAcl }) => {
  const { data, error, mutate } = useSWR<
    ISecretaryRequest<SecretaryNodePath, { Acl: true }>[]
  >(`${API}/acl/${name}/secretaryrequest`, (url: string) =>
    fetcher({ url }).then((res) => res.data)
  );
  const getContent = useLocale();

  const { setPopup } = usePopup();

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <TableBox
          title={getContent("secretaryRequests")}
          actions={[
            {
              id: "CreateSecretaryRequest",
              content: (
                <Button
                  onClick={() =>
                    setPopup(
                      "CreateSecretaryRequestPopup",
                      <CreateSecretaryRequestPopup
                        name={name}
                        mutate={mutate}
                      />
                    )
                  }
                >
                  {getContent("newItem")}
                </Button>
              ),
            },
          ]}
        >
          <Table
            data={data}
            name="DoctorManageSecretaryRequests"
            renderer={{
              submittedAt: {
                name: getContent("submittedAt"),
                value: (node) => new Date(node.submittedAt),
                component: (node) => <FormatDate value={node.submittedAt} />,
                filter: "Date",
              },
              accessLevel: {
                name: getContent("accessLevel"),
                value: (node) =>
                  node.acl ? node.acl.name : getContent("notAssigned"),
                filter: "Multi",
              },
              phone: {
                name: getContent("phone"),
                value: (node) => node.phone,
                filter: "Text",
              },
              displayName: {
                name: getContent("displayName"),
                filter: "Text",
                value: (node) => node.displayName,
              },
              message: {
                name: getContent("message"),
                value: (node) => node.message,
                filter: "Text",
              },
              status: {
                name: getContent("status"),
                value: (node) => getContent(node.status),
                filter: "Set",
              },
              actions: {
                name: getContent("actions"),
                component: (node) => (
                  <TableActions>
                    <IconButton
                      variant="Info"
                      onClick={() =>
                        setPopup(
                          "EditSecretaryRequest",
                          <EditSecretaryRequestPopup
                            mutate={mutate}
                            node={node}
                            name={name}
                          />
                        )
                      }
                    >
                      <EditIcon />
                    </IconButton>
                  </TableActions>
                ),
              },
            }}
          />
        </TableBox>
      )}
    </HandleLoading>
  );
};

export default SecretaryRequestsTab;
