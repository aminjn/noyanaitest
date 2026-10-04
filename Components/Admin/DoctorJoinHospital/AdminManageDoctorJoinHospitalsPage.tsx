"use client";

import { useCallback } from "react";
import useSWR from "swr";
import classes from "./AdminManageDoctorJoinHospitalsPage.module.css";
import {
  doctorJoinHospitalStatusesDict,
  IDoctorJoinHospitalRequest,
  joinHospitalSubmissionPartyDict,
} from "@/Components/DoctorPanel/Hospital/DoctorJoinHospitalsTab";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "../UI/HandleLoading";
import WithTitle from "../UI/WithTitle";
import Table from "../UI/Table";
import InlineLink from "../UI/InlineLink";
import { adminPath } from "@/Components/helpers/adminPath";
import {
  getDoctorProfileLabel,
  getHospitalLabel,
} from "../Lib/LabelGetters";
import TableActions from "../UI/TableActions";
import IconButton from "../UI/IconButton";
import CheckIcon from "@/Components/Icons/CheckIcon";
import GarbageIcon from "@/Components/Icons/GarbageIcon";
import usePopup from "@/Components/Hooks/usePopup";
import RequestActionsPopup from "../Requests/RequestActionsPopup";
import { JoinApproveButton } from "../Requests/RequestApproveButtons";
import useOpenFromQuery from "../Requests/useOpenFromQuery";
import DeleteDoctorJoinHospitalPopup from "./DeleteDoctorJoinHospitalPopup";
import { ta } from "@/Components/Admin/i18n/adminText";

const AdminManageDoctorJoinHospitalsPage = () => {
  const { data, error, mutate } = useSWR<
    IDoctorJoinHospitalRequest<{
      Hospital: Record<never, never>;
      Doctor: Record<never, never>;
    }>[]
  >(`${API}/auto/doctorjoinhospital`, (url: string) =>
    fetcher({ url }).then((res) =>
      Array.isArray(res?.data?.data) ? res.data.data : [],
    ),
  );

  const { setPopup } = usePopup();

  const openActions = useCallback(
    (node: IDoctorJoinHospitalRequest<{ Hospital: Record<never, never>; Doctor: Record<never, never> }>) =>
      setPopup(
        "DoctorJoinRequestActions",
        <RequestActionsPopup
          title={ta("درخواست عضویت پزشک در بیمارستان")}
          group="join"
          kind="hospital"
          node={node}
          mutate={mutate}
          approve={
            <JoinApproveButton
              kind="hospital"
              requestId={node._id}
              mutate={mutate}
            />
          }
        >
          <p>
            {ta("درخواست عضویت دکتر ${1} در ${2}", [
              node.doctor ? getDoctorProfileLabel(node.doctor) : "",
              node.hospital ? getHospitalLabel(node.hospital) : "",
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
        <WithTitle title={ta("درخواست های عضویت پزشکان در بیمارستان ها")}>
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
              hospital: {
                name: ta("بیمارستان"),
                value: (node) => node.hospital?.name,
                filter: "Multi",
                component: (node) =>
                  node.hospital ? (
                    <InlineLink href={adminPath(`/hospital/${node.hospital._id}`)}>
                      {node.hospital.name || node.hospital._id}
                    </InlineLink>
                  ) : (
                    ta("حذف شده")
                  ),
              },
              status: {
                name: ta("وضعیت"),
                value: (node) => doctorJoinHospitalStatusesDict[node.status],
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
                  joinHospitalSubmissionPartyDict[node.submissionParty],
                filter: "Set",
              },
              submittedAt: {
                name: ta("زمان ثبت"),
                value: (node) => new Date(node.submittedAt),
                filter: "Date",
              },
              statusLastChangedAt: {
                name: ta("آخرین تغییر وضعیت"),
                value: (node) => new Date(node.statusLastChangedAt),
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
                      variant="Danger"
                      title={ta("حذف")}
                      onClick={() =>
                        setPopup(
                          "DeleteDoctorJoinHospital",
                          <DeleteDoctorJoinHospitalPopup
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
            name="AdminManageDoctorJoinHospitals"
          />
        </WithTitle>
      )}
    </HandleLoading>
  );
};

export default AdminManageDoctorJoinHospitalsPage;
