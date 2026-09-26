import useSWR from "swr";
import classes from "./DoctorJoinClinicsTab.module.css";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import TableBox from "@/Components/UI/TableBox";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import Table from "@/Components/Admin/UI/Table";
import usePopup from "@/Components/Hooks/usePopup";
import Button from "@/Components/UI/Button";
import PlusIcon from "@/Components/Icons/PlusIcon";
import SubmitAJoinClinicRequestPopup from "./SubmitAJoinClinicRequestPopup";
import { MongoDoc } from "@/Components/Hooks/useUser";
import { DoctorProfilePopulation, IDoctorProfile } from "../DoctorPanelPage";
import {
  ClinicPopulation,
  IClinic,
  Population,
} from "@/Components/Admin/Clinic/AdminManageClinicsPage";
import FormatDate from "@/Components/UI/FormatDate";
import TableActions from "@/Components/Admin/UI/TableActions";
import IconButton from "@/Components/Admin/UI/IconButton";
import EditIcon from "@/Components/Icons/EditIcon";
import RetryIcon from "@/Components/Icons/RetryIcon";
import ResubmitJoinClinicRequestPopup from "./ResubmitJoinClinicRequestPopup";
import ToggleJoinClinicRequestStatusPopup from "./ToggleJoinClinicRequestStatusPopup";
import InlineLink from "@/Components/Admin/UI/InlineLink";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const NS: ContentNamespace[] = ["common", "doctorPanelClinic"];

export type Dictionary<T extends string> = Record<T, string>;

export const doctorJoinClinicStatuses = [
  "Pending",
  "Approved",
  "Rejected",
] as const;

export type DoctorJoinClinicStatus = (typeof doctorJoinClinicStatuses)[number];

export const doctorJoinClinicStatusesDict: Dictionary<DoctorJoinClinicStatus> =
  { Approved: "تایید شده", Pending: "منتظر تایید", Rejected: "رد شده" };

export const joinClinicSubmissionParties = ["DoctorProfile", "Clinic"] as const;

export type JoinClinicSubmissionParty =
  (typeof joinClinicSubmissionParties)[number];

export const joinClinicSubmissionPartyDict: Dictionary<JoinClinicSubmissionParty> =
  { Clinic: "کلینیک", DoctorProfile: "دکتر" };

export type DoctorJoinClinicPopulation = Population<{
  Doctor: DoctorProfilePopulation;
  Clinic: ClinicPopulation;
}>;

export interface IDoctorJoinClinicRequest<
  T extends DoctorJoinClinicPopulation = DoctorJoinClinicPopulation
> extends MongoDoc {
  status: DoctorJoinClinicStatus;
  submittedAt: Date;
  submissionParty: JoinClinicSubmissionParty;
  doctor: T["Doctor"] extends DoctorProfilePopulation
    ? IDoctorProfile<T["Doctor"]> | null
    : string;
  clinic: T["Clinic"] extends ClinicPopulation ? IClinic | null : string;
  statusLastChangedAt: Date;
  message?: string;
}

const DoctorJoinClinicsTab = () => {
  const { data, error, mutate } = useSWR<
    IDoctorJoinClinicRequest<{ Clinic: Record<never, never> }>[]
  >(`${API}/doctor/clinicjoin`, (url: string) =>
    fetcher({ url }).then((res) => res.data)
  );

  const getContent = useScopedLocale(NS);

  const { setPopup } = usePopup();

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <TableBox
          title={getContent("doctorJoinClinics")}
          actions={[
            {
              id: "Join",
              content: (
                <Button
                  leadIcon={<PlusIcon />}
                  onClick={() =>
                    setPopup(
                      "SubmitAJoinClinicRequest",
                      <SubmitAJoinClinicRequestPopup mutate={mutate} />
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
            name="DoctorManageJoinClinicRequests"
            renderer={{
              submittedAt: {
                name: getContent("submittedAt"),
                value: (node) => new Date(node.submittedAt),
                component: (node) => <FormatDate value={node.submittedAt} />,
                filter: "Date",
              },
              clinic: {
                name: getContent("clinicName"),
                value: (node) => node.clinic?.name,
                component: (node) =>
                  node.clinic ? (
                    <InlineLink
                      //TODO: minimum data on server side
                      href={`/clinic/${node.clinic.slug || node.clinic._id}`}
                    >
                      {node.clinic.name}
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
                    : getContent("clinic"),
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
                              "ResubmitJoinClinicRequest",
                              <ResubmitJoinClinicRequestPopup
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
                              "ToggleJoinClinicRequestStatus",
                              <ToggleJoinClinicRequestStatusPopup node={node} mutate={mutate} />
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

export default DoctorJoinClinicsTab;
