import useSWR from "swr";
import classes from "./DoctorSecretariesTab.module.css";
import { API } from "@/Components/config";
import { IDoctorSecretary } from "../Request/CreateDoctorSecretaryRequestPopup";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import Table from "@/Components/Admin/UI/Table";
import useLocale from "@/Components/Hooks/useLocale";
import TableActions from "@/Components/Admin/UI/TableActions";
import EditIcon from "@/Components/Icons/EditIcon";
import IconButton from "@/Components/Admin/UI/IconButton";
import Garbageicon from "@/Components/Icons/GarbageIcon";
import usePopup from "@/Components/Hooks/usePopup";
import DoctorMutateSecretaryPopup from "./DoctorMutateSecretaryPopup";
import DoctorDeleteSecretaryPopup from "./DoctorDeleteSecretaryPopup";

const DoctorSecretariesTab = () => {
  const { data, error, mutate } = useSWR<
    IDoctorSecretary<{ Secretary: true; AccessLevel: true }>[]
  >(`${API}/doctor/secretary`, (url: string) =>
    fetcher({ url }).then((res) => res.data)
  );

  const getContent = useLocale();

  const { setPopup } = usePopup();

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <Table
          data={data}
          name="DoctorManageSecretaries"
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
                node.accessLevel
                  ? node.accessLevel.name
                  : getContent("notAssigned"),
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
                        <DoctorMutateSecretaryPopup
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
                        "DoctorDeleteSecretary",
                        <DoctorDeleteSecretaryPopup
                          mutate={mutate}
                          node={node}
                        />
                      )
                    }
                  >
                    <Garbageicon />
                  </IconButton>
                </TableActions>
              ),
            },
          }}
        />
      )}
    </HandleLoading>
  );
};

export default DoctorSecretariesTab;
