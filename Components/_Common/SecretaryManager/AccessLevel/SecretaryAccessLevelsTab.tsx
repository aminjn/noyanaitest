import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import TableBox from "@/Components/UI/TableBox";
import useLocale from "@/Components/Hooks/useLocale";
import Table from "@/Components/Admin/UI/Table";
import usePopup from "@/Components/Hooks/usePopup";
import Button from "@/Components/UI/Button";
import BooleanToIcon from "@/Components/UI/BooleanToIcon";
import TableActions from "@/Components/Admin/UI/TableActions";
import IconButton from "@/Components/Admin/UI/IconButton";
import EyeIcon from "@/Components/Icons/EyeIcon";
import EditIcon from "@/Components/Icons/EditIcon";
import GarbageIcon from "@/Components/Icons/GarbageIcon";
import { Fragment } from "react";
import { Acl, NodeWithAcl } from "../Request/CreateSecretaryRequestPopup";
import MutateSecretaryAccessLevelPopup from "./MutateSecretaryAccessLevelPopup";
import PreviewSecretaryAccessLevelPopup from "./PreviewSecretaryAccessLevelPopup";
import DeleteSecretaryAccessLevelPopup from "./DeleteSecretaryAccessLevelPopup";

const SecretaryAccessLevelsTab = ({ name }: { name: NodeWithAcl }) => {
  const { data, error, mutate } = useSWR<Acl<[], unknown>[]>(
    `${API}/acl/${name}/acl`,
    (url: string) => fetcher({ url }).then((res) => res.data)
  );

  const getContent = useLocale();

  const { setPopup } = usePopup();

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <TableBox
          title={getContent("accessLevels")}
          actions={[
            {
              id: "NewAccessLevel",
              content: (
                <Button
                  onClick={() =>
                    setPopup(
                      "MutateSecretaryAccessLevel",
                      <MutateSecretaryAccessLevelPopup
                        mutate={mutate}
                        name={name}
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
            name="ManageAccessLevels"
            data={data}
            renderer={{
              name: {
                name: getContent("name"),
                value: (node) => node.name,
                filter: "Text",
              },
              owner: {
                name: getContent("isDefault"),
                value: (node) =>
                  !!node.owner ? getContent("no") : getContent("yes"),
                component: (node) => <BooleanToIcon value={!node.owner} />,
                filter: "Set",
              },
              actions: {
                name: getContent("actions"),
                component: (node) => (
                  <TableActions>
                    <IconButton
                      variant="Success"
                      onClick={() =>
                        setPopup(
                          "PreviewSecretaryAccessLevel",
                          <PreviewSecretaryAccessLevelPopup
                            node={node}
                            name="doctor"
                          />
                        )
                      }
                    >
                      <EyeIcon />
                    </IconButton>
                    {!!node.owner && (
                      <Fragment>
                        <IconButton
                          variant="Info"
                          onClick={() =>
                            setPopup(
                              "MutateSecretaryAccessLevelPopup",
                              <MutateSecretaryAccessLevelPopup
                                mutate={mutate}
                                node={node}
                                name={name}
                              />
                            )
                          }
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          variant="Danger"
                          onClick={() =>
                            setPopup(
                              "DeleteSecretaryAccessLevel",
                              <DeleteSecretaryAccessLevelPopup
                                name={name}
                                mutate={mutate}
                                node={node}
                              />
                            )
                          }
                        >
                          <GarbageIcon />
                        </IconButton>
                      </Fragment>
                    )}
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

export default SecretaryAccessLevelsTab;
