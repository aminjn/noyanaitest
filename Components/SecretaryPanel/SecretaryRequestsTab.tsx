import useSWR from "swr";
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
import { IDoctorProfile } from "@/Components/DoctorPanel/DoctorPanelPage";
import { IClinic } from "@/Components/Admin/Clinic/AdminManageClinicsPage";
import SecretaryMutateRequestPopup from "./SecretaryMutateRequestPopup";
import {
  NodeWithAcl,
  SecretaryNodePath,
} from "../_Common/SecretaryManager/Request/CreateSecretaryRequestPopup";
import { ISecretaryRequest } from "../_Common/SecretaryManager/Request/SecretaryRequestsTab";

const SecretaryRequestsTab = ({ name }: { name: NodeWithAcl }) => {
  const { data, error, mutate } = useSWR<
    ISecretaryRequest<SecretaryNodePath, { Owner: true }>[]
  >(`${API}/secretary/request/${name}`, (url: string) =>
    fetcher({ url }).then((res) => res.data)
  );

  const getContent = useLocale();

  const { setPopup } = usePopup();

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <TableBox title={getContent("secretaryIncomingRequests")}>
          <Table
            data={data}
            name="SecretaryManageRequests"
            renderer={{
              submittedAt: {
                name: getContent("submittedAt"),
                value: (node) => new Date(node.submittedAt),
                component: (node) => <FormatDate value={node.submittedAt} />,
                filter: "Date",
              },
              boss: {
                name: getContent("boss"),
                value: (node) =>
                  node.ownerPath === "DoctorProfile"
                    ? getDoctorProfileLabel(node.owner as IDoctorProfile)
                    : (node.owner as IClinic).name,
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
                            "SecretaryMutateRequest",
                            <SecretaryMutateRequestPopup
                              mutate={mutate}
                              node={node}
                              name={name}
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

export default SecretaryRequestsTab;
