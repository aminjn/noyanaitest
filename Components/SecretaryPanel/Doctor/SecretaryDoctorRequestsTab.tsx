import useSWR from "swr";
import classes from "./SecretaryDoctorRequestsTab.module.css";
import { IDoctorSecretaryRequest } from "@/Components/DoctorPanel/Secretary/Request/DoctorSecretaryRequestsTab";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import TableBox from "@/Components/UI/TableBox";
import useLocale from "@/Components/Hooks/useLocale";
import Table from "@/Components/Admin/UI/Table";
import { getDoctorProfileLabel } from "@/Components/Admin/Lib/LabelGetters";
import FormatDate from "@/Components/UI/FormatDate";
import TableActions from "@/Components/Admin/UI/TableActions";
import IconButton from "@/Components/Admin/UI/IconButton";
import EditIcon from "@/Components/Icons/EditIcon";
import usePopup from "@/Components/Hooks/usePopup";
import SecretaryMutateDoctorRequestPopup from "./SecretaryMutateDoctorRequestPopup";

const SecretaryDoctorRequestsTab = () => {
  const { data, error, mutate } = useSWR<
    IDoctorSecretaryRequest<{ Doctor: Record<string, never> }>[]
  >(`${API}/secretary/doctorrequest`, (url: string) =>
    fetcher({ url }).then((res) => res.data)
  );

  const getContent = useLocale();

  const { setPopup } = usePopup();

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <TableBox title={getContent("secretaryIncomingDoctorRequests")}>
          <Table
            data={data}
            name="SecretaryManageDoctorRequests"
            renderer={{
              submittedAt: {
                name: getContent("submittedAt"),
                value: (node) => new Date(node.submittedAt),
                component: (node) => <FormatDate value={node.submittedAt} />,
                filter: "Date",
              },
              doctor: {
                name: getContent("doctor"),
                value: (node) => getDoctorProfileLabel(node.doctor),
                filter: "Text",
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
                    {node.status === "Pending" && (
                      <IconButton
                        onClick={() =>
                          setPopup(
                            "SecretaryMutateDoctorRequest",
                            <SecretaryMutateDoctorRequestPopup
                              mutate={mutate}
                              node={node}
                            />
                          )
                        }
                      >
                        <EditIcon />
                      </IconButton>
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

export default SecretaryDoctorRequestsTab;
