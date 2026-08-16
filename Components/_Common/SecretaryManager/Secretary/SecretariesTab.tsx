import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import Table from "@/Components/Admin/UI/Table";
import useLocale from "@/Components/Hooks/useLocale";
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
// import DeleteSecretaryPopup from "./DeleteSecretaryPopup";

const SecretariesTab = ({ name }: { name: NodeWithAcl }) => {
  const { data, error, mutate } = useSWR<
    ISecretary<SecretaryNodePath, { Acl: true; Secretary: true }>[]
  >(`${API}/acl/${name}/secretary`, (url: string) =>
    fetcher({ url }).then((res) => res.data),
  );

  const getContent = useLocale();

  const { setPopup } = usePopup();

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
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
                  {/* <IconButton
                    variant="Danger"
                    onClick={() =>
                      setPopup(
                        "DoctorDeleteSecretary",
                        <DeleteSecretaryPopup
                          mutate={mutate}
                          node={node}
                          name={name}
                        />,
                      )
                    }
                  >
                    <GarbageIcon />
                  </IconButton> */}
                </TableActions>
              ),
            },
          }}
        />
      )}
    </HandleLoading>
  );
};

export default SecretariesTab;
