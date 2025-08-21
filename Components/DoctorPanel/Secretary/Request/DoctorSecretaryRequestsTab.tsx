import TableBox from "@/Components/UI/TableBox";
import classes from "./DoctorSecretaryRequestsTab.module.css";
import useLocale from "@/Components/Hooks/useLocale";
import Table from "@/Components/Admin/UI/Table";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import useSWR from "swr";
import { API } from "@/Components/config";
import { MongoDoc } from "@/Components/Hooks/useUser";
import { Population } from "@/Components/Admin/Clinic/AdminManageClinicsPage";
import { fetcher } from "@/Components/helpers/fetcher";
import FormatDate from "@/Components/UI/FormatDate";
import { IDoctorSecretaryAccessLevel } from "@/Components/Admin/DoctorSecretaryAccessLevel/AdminManageDoctorSecretaryAccessLevelsPage";
import TableActions from "@/Components/Admin/UI/TableActions";
import IconButton from "@/Components/Admin/UI/IconButton";
import EditIcon from "@/Components/Icons/EditIcon";
import Garbageicon from "@/Components/Icons/GarbageIcon";
import usePopup from "@/Components/Hooks/usePopup";
import DeleteDoctorSecretaryRequestPopup from "./DeleteDoctorSecretaryRequestPopup";
import Button from "@/Components/UI/Button";
import CreateDoctorSecretaryRequestPopup from "./CreateDoctorSecretaryRequestPopup";
import { DoctorProfilePopulation, IDoctorProfile } from "../../DoctorPanelPage";
import EditDoctorSecretaryRequestPopup from "./EditDoctorSecretaryRequestPopup";

export type DoctorSecretaryRequestPopulation = Population<{
  Doctor: DoctorProfilePopulation;
  AccessLevel: true;
}>;

export const doctorSecretaryRequestStatuses = [
  "Pending",
  "Approved",
  "Rejected",
] as const;

export type DoctorSecretaryRequestStatus =
  (typeof doctorSecretaryRequestStatuses)[number];

export interface IDoctorSecretaryRequest<
  T extends DoctorSecretaryRequestPopulation = DoctorSecretaryRequestPopulation
> extends MongoDoc {
  submittedAt: Date;
  doctor: T["Doctor"] extends DoctorProfilePopulation
    ? IDoctorProfile<T["Doctor"]>
    : string;
  accessLevel?: T["AccessLevel"] extends true
    ? IDoctorSecretaryAccessLevel
    : string;
  phone: string;
  status: DoctorSecretaryRequestStatus;
  displayName?: string;
  message?: string;
}

const DoctorSecretaryRequestsTab = () => {
  const { data, error, mutate } = useSWR<
    IDoctorSecretaryRequest<{ AccessLevel: true }>[]
  >(`${API}/doctor/secretaryrequest`, (url: string) =>
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
              id: "CreateDoctorSecretaryRequest",
              content: (
                <Button
                  onClick={() =>
                    setPopup(
                      "CreateDoctorSecretaryRequestPopup",
                      <CreateDoctorSecretaryRequestPopup mutate={mutate} />
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
                  node.accessLevel
                    ? node.accessLevel.name
                    : getContent("notAssigned"),
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
                          "EditDoctorSecretaryRequest",
                          <EditDoctorSecretaryRequestPopup
                            mutate={mutate}
                            node={node}
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

export default DoctorSecretaryRequestsTab;
