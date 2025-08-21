import useSWR from "swr";
import classes from "./SecretaryDoctorsTab.module.css";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import TableBox from "@/Components/UI/TableBox";
import useLocale from "@/Components/Hooks/useLocale";
import Table from "@/Components/Admin/UI/Table";
import { IDoctorSecretary } from "@/Components/DoctorPanel/Secretary/Request/CreateDoctorSecretaryRequestPopup";
import { getDoctorProfileLabel } from "@/Components/Admin/Lib/LabelGetters";
import TableActions from "@/Components/Admin/UI/TableActions";
import IconButton from "@/Components/Admin/UI/IconButton";
import Garbageicon from "@/Components/Icons/GarbageIcon";
import MountIcon from "@/Components/Icons/MountIcon";
import usePopup from "@/Components/Hooks/usePopup";
import MountDoctorPopup from "./MountDoctorPopup";
import LeaveDoctorPopup from "./LeaveDoctorPopup";

const SecretaryDoctorsTab = () => {
  const { data, error, mutate } = useSWR<
    IDoctorSecretary<{ Doctor: Record<string, never> }>[]
  >(`${API}/secretary/doctor`, (url: string) =>
    fetcher({ url }).then((res) => res.data)
  );

  const getContent = useLocale();

  const { setPopup } = usePopup();

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <TableBox title={getContent("doctors")}>
          <Table
            name="SecretaryManageDoctors"
            data={data}
            renderer={{
              doctor: {
                name: getContent("doctor"),
                value: (node) =>
                  node.doctor ? getDoctorProfileLabel(node.doctor) : "",
                filter: "Text",
              },
              actions: {
                name: getContent("actions"),
                component: (node) => (
                  <TableActions>
                    <IconButton
                      onClick={() =>
                        setPopup(
                          "MountDoctor",
                          <MountDoctorPopup node={node} />
                        )
                      }
                    >
                      <MountIcon />
                    </IconButton>
                    <IconButton
                      variant="Danger"
                      onClick={() =>
                        setPopup(
                          "LeaveDoctor",
                          <LeaveDoctorPopup mutate={mutate} node={node} />
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
        </TableBox>
      )}
    </HandleLoading>
  );
};

export default SecretaryDoctorsTab;
