import useSWR from "swr";
import classes from "./DoctorJoinHospitalsTab.module.css";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import TableBox from "@/Components/UI/TableBox";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import Table from "@/Components/Admin/UI/Table";
import usePopup from "@/Components/Hooks/usePopup";
import Button from "@/Components/UI/Button";
import PlusIcon from "@/Components/Icons/PlusIcon";
import SubmitAJoinHospitalRequestPopup from "./SubmitAJoinHospitalRequestPopup";
import { MongoDoc } from "@/Components/Hooks/useUser";
import { DoctorProfilePopulation, IDoctorProfile } from "../DoctorPanelPage";
import {
  HospitalPopulation,
  IHospital,
} from "@/Components/Admin/Hospital/AdminManageHospitalsPage";
import { Population } from "@/Components/Admin/Clinic/AdminManageClinicsPage";
import FormatDate from "@/Components/UI/FormatDate";
import TableActions from "@/Components/Admin/UI/TableActions";
import IconButton from "@/Components/Admin/UI/IconButton";
import EditIcon from "@/Components/Icons/EditIcon";
import RetryIcon from "@/Components/Icons/RetryIcon";
import ResubmitJoinHospitalRequestPopup from "./ResubmitJoinHospitalRequestPopup";
import ToggleJoinHospitalRequestStatusPopup from "./ToggleJoinHospitalRequestStatusPopup";
import InlineLink from "@/Components/Admin/UI/InlineLink";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import { ta } from "@/Components/Admin/i18n/adminText";

const NS: ContentNamespace[] = ["common", "doctorPanelHospital"];

export type Dictionary<T extends string> = Record<T, string>;

export const doctorJoinHospitalStatuses = [
  "Pending",
  "Approved",
  "Rejected",
] as const;

export type DoctorJoinHospitalStatus = (typeof doctorJoinHospitalStatuses)[number];

export const doctorJoinHospitalStatusesDict: Dictionary<DoctorJoinHospitalStatus> =
  { get Approved() {
  return ta("تایید شده");
}, get Pending() {
  return ta("منتظر تایید");
}, get Rejected() {
  return ta("رد شده");
} };

export const joinHospitalSubmissionParties = ["DoctorProfile", "Hospital"] as const;

export type JoinHospitalSubmissionParty =
  (typeof joinHospitalSubmissionParties)[number];

export const joinHospitalSubmissionPartyDict: Dictionary<JoinHospitalSubmissionParty> =
  { get Hospital() {
  return ta("بیمارستان");
}, get DoctorProfile() {
  return ta("دکتر");
} };

export type DoctorJoinHospitalPopulation = Population<{
  Doctor: DoctorProfilePopulation;
  Hospital: HospitalPopulation;
}>;

export interface IDoctorJoinHospitalRequest<
  T extends DoctorJoinHospitalPopulation = DoctorJoinHospitalPopulation
> extends MongoDoc {
  status: DoctorJoinHospitalStatus;
  submittedAt: Date;
  submissionParty: JoinHospitalSubmissionParty;
  doctor: T["Doctor"] extends DoctorProfilePopulation
    ? IDoctorProfile<T["Doctor"]> | null
    : string;
  hospital: T["Hospital"] extends HospitalPopulation ? IHospital | null : string;
  statusLastChangedAt: Date;
  message?: string;
}

const DoctorJoinHospitalsTab = () => {
  const { data, error, mutate } = useSWR<
    IDoctorJoinHospitalRequest<{ Hospital: Record<never, never> }>[]
  >(`${API}/doctor/hospitaljoin`, (url: string) =>
    fetcher({ url }).then((res) => res.data)
  );

  const getContent = useScopedLocale(NS);

  const { setPopup } = usePopup();

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <TableBox
          title={getContent("doctorJoinHospitals")}
          actions={[
            {
              id: "Join",
              content: (
                <Button
                  leadIcon={<PlusIcon />}
                  onClick={() =>
                    setPopup(
                      "SubmitAJoinHospitalRequest",
                      <SubmitAJoinHospitalRequestPopup mutate={mutate} />
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
            name="DoctorManageJoinHospitalRequests"
            renderer={{
              submittedAt: {
                name: getContent("submittedAt"),
                value: (node) => new Date(node.submittedAt),
                component: (node) => <FormatDate value={node.submittedAt} />,
                filter: "Date",
              },
              hospital: {
                name: getContent("hospitalName"),
                value: (node) => node.hospital?.name,
                component: (node) =>
                  node.hospital ? (
                    <InlineLink
                      //TODO: minimum data on server side
                      href={`/hospital/${node.hospital.slug || node.hospital._id}`}
                    >
                      {node.hospital.name}
                    </InlineLink>
                  ) : (
                    ""
                  ),
                filter: "Text",
              },
              submissionParty: {
                name: getContent("submissionParty"),
                value: (node) =>
                  node.submissionParty === "DoctorProfile"
                    ? getContent("doctor")
                    : getContent("hospital"),
                filter: "Set",
              },
              status: {
                name: getContent("status"),
                value: (node) => getContent(node.status),
                filter: "Set",
              },
              message: {
                name: getContent("message"),
                value: (node) => node.message,
                filter: "Text",
              },
              statusLastChangedAt: {
                name: getContent("statusLastChangedAt"),
                value: (node) => new Date(node.statusLastChangedAt),
                component: (node) => (
                  <FormatDate value={node.statusLastChangedAt} />
                ),
                filter: "Date",
              },
              actions: {
                name: getContent("actions"),
                component: (node) => (
                  <TableActions>
                    {node.submissionParty === "DoctorProfile" &&
                      node.status === "Rejected" && (
                        <IconButton
                          onClick={() =>
                            setPopup(
                              "ResubmitJoinHospitalRequest",
                              <ResubmitJoinHospitalRequestPopup
                                node={node}
                                mutate={mutate}
                              />
                            )
                          }
                        >
                          <RetryIcon />
                        </IconButton>
                      )}
                    {node.submissionParty !== "DoctorProfile" &&
                      node.status === "Pending" && (
                        <IconButton
                          onClick={() =>
                            setPopup(
                              "ToggleJoinHospitalRequestStatus",
                              <ToggleJoinHospitalRequestStatusPopup node={node} mutate={mutate} />
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

export default DoctorJoinHospitalsTab;
