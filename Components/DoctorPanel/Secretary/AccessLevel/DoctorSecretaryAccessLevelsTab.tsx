import useSWR from "swr";
import classes from "./DoctorSecretaryAccessLevelsTab.module.css";
import { IDoctorSecretaryAccessLevel } from "@/Components/Admin/DoctorSecretaryAccessLevel/AdminManageDoctorSecretaryAccessLevelsPage";
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
import MutateDoctorSecretaryAccessLevelPopup from "./MutateDoctorSecretaryAccessLevelPopup";
import IconButton from "@/Components/Admin/UI/IconButton";
import EyeIcon from "@/Components/Icons/EyeIcon";
import EditIcon from "@/Components/Icons/EditIcon";
import Garbageicon from "@/Components/Icons/GarbageIcon";
import PreviewDoctorSecretaryAccessLevelPopup from "./PreviewDoctorSecretaryAccessLevelPopup";
import { Fragment } from "react";
import DeleteDoctorSecretaryAccessLevelPopup from "./DeleteDoctorSecretaryAccessLevelPopup";

const DoctorSecretaryAccessLevelsTab = () => {
  const { data, error, mutate } = useSWR<IDoctorSecretaryAccessLevel[]>(
    `${API}/doctor/accesslevel`,
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
                      "MutateDoctorSecretaryAccessLevel",
                      <MutateDoctorSecretaryAccessLevelPopup mutate={mutate} />
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
            name="DoctorMasnageAccessLevels"
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
                          "PreviewDoctorSecretaryAccessLevel",
                          <PreviewDoctorSecretaryAccessLevelPopup node={node} />
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
                              "MutateDoctorSecretaryAccessLevelPopup",
                              <MutateDoctorSecretaryAccessLevelPopup
                                mutate={mutate}
                                node={node}
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
                              "DeleteDoctorSecretaryAccessLevel",
                              <DeleteDoctorSecretaryAccessLevelPopup
                                mutate={mutate}
                                node={node}
                              />
                            )
                          }
                        >
                          <Garbageicon />
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

export default DoctorSecretaryAccessLevelsTab;
