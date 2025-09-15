import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import TableBox from "@/Components/UI/TableBox";
import useLocale from "@/Components/Hooks/useLocale";
import Table from "@/Components/Admin/UI/Table";
import { getDoctorProfileLabel } from "@/Components/Admin/Lib/LabelGetters";
import TableActions from "@/Components/Admin/UI/TableActions";
import IconButton from "@/Components/Admin/UI/IconButton";
import GarbageIcon from "@/Components/Icons/GarbageIcon";
import MountIcon from "@/Components/Icons/MountIcon";
import usePopup from "@/Components/Hooks/usePopup";
import { IClinic } from "@/Components/Admin/Clinic/AdminManageClinicsPage";
import { IDoctorProfile } from "@/Components/DoctorPanel/DoctorPanelPage";
import MountBossPopup from "./MountBossPopup";
import LeaveBossPopup from "./LeaveBossPopup";
import {
  ISecretary,
  NodeWithAcl,
  SecretaryNodePath,
} from "../_Common/SecretaryManager/Request/CreateSecretaryRequestPopup";

const SecretaryBossesTab = ({ name }: { name: NodeWithAcl }) => {
  const { data, error, mutate } = useSWR<
    ISecretary<SecretaryNodePath, { owner: true }>[]
  >(`${API}/secretary/boss/${name}`, (url: string) =>
    fetcher({ url }).then((res) => res.data)
  );

  const getContent = useLocale();

  const { setPopup } = usePopup();

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <TableBox title={getContent("bosses")}>
          <Table
            name="SecretaryManageDoctors"
            data={data}
            renderer={{
              boss: {
                name: getContent("boss"),
                value: (node) =>
                  node.ownerPath === "DoctorProfile"
                    ? getDoctorProfileLabel(node.owner as IDoctorProfile)
                    : (node.owner as IClinic).name,
                filter: "Text",
              },
              actions: {
                name: getContent("actions"),
                component: (node) => (
                  <TableActions>
                    <IconButton
                      onClick={() =>
                        setPopup(
                          "MountBoss",
                          <MountBossPopup node={node} name={name} />
                        )
                      }
                    >
                      <MountIcon />
                    </IconButton>
                    <IconButton
                      variant="Danger"
                      onClick={() =>
                        setPopup(
                          "LeaveBoss",
                          <LeaveBossPopup
                            mutate={mutate}
                            node={node}
                            name={name}
                          />
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
        </TableBox>
      )}
    </HandleLoading>
  );
};

export default SecretaryBossesTab;
