"use client";

import { useCallback } from "react";
import useSWR from "swr";
import classes from "./AdminManageClinicAdditionsPage.module.css";
import {
  additionRequestStatusDict,
  IClinicAdditionRequest,
} from "@/Components/DoctorPanel/Clinic/DoctorClinicAdditionsTab";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "../UI/HandleLoading";
import WithTitle from "../UI/WithTitle";
import Table from "../UI/Table";
import { getDoctorProfileLabel } from "../Lib/LabelGetters";
import InlineLink from "../UI/InlineLink";
import { adminPath } from "@/Components/helpers/adminPath";
import { findCity } from "@/Components/Enums/Cities";
import TableActions from "../UI/TableActions";
import IconButton from "../UI/IconButton";
import CheckIcon from "@/Components/Icons/CheckIcon";
import GarbageIcon from "@/Components/Icons/GarbageIcon";
import usePopup from "@/Components/Hooks/usePopup";
import RequestActionsPopup from "../Requests/RequestActionsPopup";
import { AdditionApproveButton } from "../Requests/RequestApproveButtons";
import useOpenFromQuery from "../Requests/useOpenFromQuery";
import DeleteClinicAdditionRequestPopup from "./DeleteClinicAdditionRequestPopup";
import { ta } from "@/Components/Admin/i18n/adminText";

const AdminManageClinicAdditionsPage = () => {
  const { data, error, mutate } = useSWR<
    IClinicAdditionRequest<{ user: Record<never, never> }>[]
  >(`${API}/auto/clinicaddition`, (url: string) =>
    fetcher({ url }).then((res) =>
      Array.isArray(res?.data?.data) ? res.data.data : [],
    ),
  );

  const { setPopup } = usePopup();

  const openActions = useCallback(
    (node: IClinicAdditionRequest<{ user: Record<never, never> }>) =>
      setPopup(
        "AdditionRequestActions",
        <RequestActionsPopup
          title={ta("درخواست افزودن کلینیک")}
          group="addition"
          kind="clinic"
          node={node}
          mutate={mutate}
          approve={
            <AdditionApproveButton
              kind="clinic"
              requestId={node._id}
              label={ta("ایجاد کلینیک")}
              mutate={mutate}
            />
          }
        >
          <p>{node.clinicName || "—"}</p>
        </RequestActionsPopup>,
      ),
    [setPopup, mutate],
  );

  useOpenFromQuery(data, openActions);

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle title={ta("درخواست های اضافه شدن کلینیک")}>
          <Table
            name="AdminManageClinicAdditionRequests"
            data={data}
            renderer={{
              clinicName: {
                name: ta("نام کلینیک"),
                value: (node) => node.clinicName,
                filter: "Text",
              },
              status: {
                name: ta("وضعیت"),
                value: (node) => additionRequestStatusDict[node.status],
                filter: "Set",
              },
              city: {
                name: ta("شهر"),
                value: (node) => findCity(node.city),
                filter: "Multi",
              },
              ownerName: {
                name: ta("مالک"),
                value: (node) => node.ownerName,
                filter: "Text",
              },
              ownerPhone: {
                name: ta("تلفن مالک"),
                value: (node) => node.ownerPhone,
                filter: "Text",
              },
              // the centre this request created or was linked to
              createdNode: {
                name: ta("مرکز ساخته‌شده"),
                value: (node) =>
                  (node as { createdNode?: string }).createdNode ? ta("دارد") : ta("ندارد"),
                filter: "Set",
                component: (node) => {
                  const id = (node as { createdNode?: string }).createdNode;
                  return id ? (
                    <InlineLink href={adminPath(`/clinic/${id}`)}>
                      {ta("مشاهده")}
                    </InlineLink>
                  ) : (
                    "—"
                  );
                },
              },
              rejectReason: {
                name: ta("دلیل رد"),
                value: (node) => node.rejectReason || "",
                filter: "Text",
              },
              submittedBy: {
                name: ta("ثبت‌کننده"),
                value: (node) =>
                  node.submittedBy
                    ? getDoctorProfileLabel(node.submittedBy)
                    : ta("حذف شده"),
                component: (node) =>
                  node.submittedBy ? (
                    <InlineLink
                      href={adminPath(`/doctorprofile/${node.submittedBy._id}`)}
                    >
                      {getDoctorProfileLabel(node.submittedBy)}
                    </InlineLink>
                  ) : (
                    ta("حذف شده")
                  ),
              },
              submittedAt: {
                name: ta("تاریخ ثبت"),
                value: (node) => new Date(node.submittedAt),
                filter: "Date",
              },
              actions: {
                name: ta("عملیات"),
                component: (node) => (
                  <TableActions>
                    <IconButton
                      variant="Success"
                      title={ta("بررسی")}
                      onClick={() => openActions(node)}
                    >
                      <CheckIcon />
                    </IconButton>
                    <IconButton
                      variant="Danger"
                      title={ta("حذف")}
                      onClick={() =>
                        setPopup(
                          "DeleteClinicAdditionRequest",
                          <DeleteClinicAdditionRequestPopup
                            node={node}
                            mutate={mutate}
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
          />
        </WithTitle>
      )}
    </HandleLoading>
  );
};

export default AdminManageClinicAdditionsPage;
