"use client";

import { useCallback } from "react";
import useSWR from "swr";
import classes from "./AdminManageDoctorJoinClinicsPage.module.css";
import {
  doctorJoinClinicStatusesDict,
  IDoctorJoinClinicRequest,
  joinClinicSubmissionPartyDict,
} from "@/Components/DoctorPanel/Clinic/DoctorJoinClinicsTab";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "../UI/HandleLoading";
import WithTitle from "../UI/WithTitle";
import Table from "../UI/Table";
import InlineLink from "../UI/InlineLink";
import { adminPath } from "@/Components/helpers/adminPath";
import {
  getClinicLabel,
  getDoctorProfileLabel,
} from "../Lib/LabelGetters";
import TableActions from "../UI/TableActions";
import IconButton from "../UI/IconButton";
import CheckIcon from "@/Components/Icons/CheckIcon";
import GarbageIcon from "@/Components/Icons/GarbageIcon";
import usePopup from "@/Components/Hooks/usePopup";
import RequestActionsPopup from "../Requests/RequestActionsPopup";
import { JoinApproveButton } from "../Requests/RequestApproveButtons";
import useOpenFromQuery from "../Requests/useOpenFromQuery";
import DeleteDoctorJoinClinicPopup from "./DeleteDoctorJoinClinicPopup";
import { ta } from "@/Components/Admin/i18n/adminText";

const AdminManageDoctorJoinClinicsPage = () => {
  const { data, error, mutate } = useSWR<
    IDoctorJoinClinicRequest<{
      Clinic: Record<never, never>;
      Doctor: Record<never, never>;
    }>[]
  >(`${API}/auto/doctorjoinclinic`, (url: string) =>
    fetcher({ url }).then((res) =>
      Array.isArray(res?.data?.data) ? res.data.data : [],
    ),
  );

  const { setPopup } = usePopup();

  const openActions = useCallback(
    (node: IDoctorJoinClinicRequest<{ Clinic: Record<never, never>; Doctor: Record<never, never> }>) =>
      setPopup(
        "DoctorJoinRequestActions",
        <RequestActionsPopup
          title={ta("درخواست عضویت پزشک در کلینیک")}
          group="join"
          kind="clinic"
          node={node}
          mutate={mutate}
          approve={
            <JoinApproveButton
              kind="clinic"
              requestId={node._id}
              mutate={mutate}
            />
          }
        >
          <p>
            {ta("درخواست عضویت دکتر ${1} در ${2}", [
              node.doctor ? getDoctorProfileLabel(node.doctor) : "",
              node.clinic ? getClinicLabel(node.clinic) : "",
            ])}
          </p>
        </RequestActionsPopup>,
      ),
    [setPopup, mutate],
  );

  useOpenFromQuery(data, openActions);

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle title={ta("درخواست های عضویت پزشکان در کلینیک ها")}>
          <Table
            data={data}
            renderer={{
              doctor: {
                name: ta("پزشک"),
                value: (node) =>
                  node.doctor ? getDoctorProfileLabel(node.doctor) : "",
                component: (node) =>
                  node.doctor ? (
                    <InlineLink
                      href={adminPath(`/doctorprofile/${node.doctor._id}`)}
                    >
                      {getDoctorProfileLabel(node.doctor)}
                    </InlineLink>
                  ) : (
                    ta("حذف شده")
                  ),
                filter: "Multi",
              },
              clinic: {
                name: ta("کلینیک"),
                value: (node) => node.clinic?.name,
                filter: "Multi",
                component: (node) =>
                  node.clinic ? (
                    <InlineLink href={adminPath(`/clinic/${node.clinic._id}`)}>
                      {node.clinic.name || node.clinic._id}
                    </InlineLink>
                  ) : (
                    ta("حذف شده")
                  ),
              },
              status: {
                name: ta("وضعیت"),
                value: (node) => doctorJoinClinicStatusesDict[node.status],
                filter: "Set",
              },
              rejectReason: {
                name: ta("دلیل رد"),
                value: (node) => node.rejectReason || "",
                filter: "Text",
              },
              submissionParty: {
                name: ta("ارسال‌کننده"),
                value: (node) =>
                  joinClinicSubmissionPartyDict[node.submissionParty],
                filter: "Set",
              },
              submittedAt: {
                name: ta("زمان ثبت"),
                value: (node) =>
                  node.submittedAt ? new Date(node.submittedAt) : undefined,
                filter: "Date",
              },
              statusLastChangedAt: {
                name: ta("آخرین تغییر وضعیت"),
                value: (node) =>
                  node.statusLastChangedAt
                    ? new Date(node.statusLastChangedAt)
                    : undefined,
                filter: "Date",
              },
              actions: {
                name: ta("عملیات"),
                component: (node) => (
                  <TableActions>
                    {/* a centre's invitation is the doctor's to answer,
                        not the admin's (the backend refuses it too) */}
                    {node.submissionParty === "DoctorProfile" && (
                      <IconButton
                        variant="Success"
                        title={ta("بررسی")}
                        onClick={() => openActions(node)}
                      >
                        <CheckIcon />
                      </IconButton>
                    )}
                    <IconButton
                      title={ta("حذف")}
                      variant="Danger"
                      onClick={() =>
                        setPopup(
                          "DeleteDoctorJoinClinic",
                          <DeleteDoctorJoinClinicPopup
                            mutate={mutate}
                            node={node}
                          />,
                        )
                      }
                    >
                      <GarbageIcon />
                    </IconButton>
                  </TableActions>
                ),
              },
            }}
            name="AdminManageDoctorJoinClinics"
          />
        </WithTitle>
      )}
    </HandleLoading>
  );
};

export default AdminManageDoctorJoinClinicsPage;
