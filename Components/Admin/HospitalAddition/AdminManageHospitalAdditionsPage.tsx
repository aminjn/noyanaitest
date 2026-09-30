"use client";

import { useCallback } from "react";
import useSWR from "swr";
import classes from "./AdminManageHospitalAdditionsPage.module.css";
import {
  additionRequestStatusDict,
  IHospitalAdditionRequest,
} from "@/Components/DoctorPanel/Hospital/DoctorHospitalAdditionsTab";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "../UI/HandleLoading";
import WithTitle from "../UI/WithTitle";
import Table from "../UI/Table";
import { getDoctorProfileLabel } from "../Lib/LabelGetters";
import InlineLink from "../UI/InlineLink";
import { adminPath } from "@/Components/helpers/adminPath";
import { findCity } from "@/Components/Enums/Cities";
import { findProvince } from "@/Components/Enums/Provinces";
import TableActions from "../UI/TableActions";
import IconButton from "../UI/IconButton";
import CheckIcon from "@/Components/Icons/CheckIcon";
import GarbageIcon from "@/Components/Icons/GarbageIcon";
import usePopup from "@/Components/Hooks/usePopup";
import RequestActionsPopup from "../Requests/RequestActionsPopup";
import { AdditionApproveButton } from "../Requests/RequestApproveButtons";
import useOpenFromQuery from "../Requests/useOpenFromQuery";
import DeleteHospitalAdditionRequestPopup from "./DeleteHospitalAdditionRequestPopup";
import { ta } from "@/Components/Admin/i18n/adminText";

const AdminManageHospitalAdditionsPage = () => {
  const { data, error, mutate } = useSWR<
    IHospitalAdditionRequest<{ user: Record<never, never> }>[]
  >(`${API}/auto/hospitaladdition`, (url: string) =>
    fetcher({ url }).then((res) =>
      Array.isArray(res?.data?.data) ? res.data.data : [],
    ),
  );

  const { setPopup } = usePopup();

  const openActions = useCallback(
    (node: IHospitalAdditionRequest<{ user: Record<never, never> }>) =>
      setPopup(
        "AdditionRequestActions",
        <RequestActionsPopup
          title={ta("درخواست افزودن بیمارستان")}
          group="addition"
          kind="hospital"
          node={node}
          mutate={mutate}
          approve={
            <AdditionApproveButton
              kind="hospital"
              requestId={node._id}
              label={ta("ایجاد بیمارستان از این درخواست")}
              mutate={mutate}
            />
          }
        >
          <p>{node.hospitalName || "—"}</p>
        </RequestActionsPopup>,
      ),
    [setPopup, mutate],
  );

  useOpenFromQuery(data, openActions);

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle title={ta("درخواست های اضافه شدن بیمارستان")}>
          <Table
            name="AdminManageHospitalAdditionRequests"
            data={data}
            renderer={{
              hospitalName: {
                name: ta("نام بیمارستان"),
                value: (node) => node.hospitalName,
                filter: "Text",
              },
              status: {
                name: ta("وضعیت"),
                value: (node) => additionRequestStatusDict[node.status],
                filter: "Set",
              },
              city: {
                name: ta("استان / شهر"),
                value: (node) =>
                  [findProvince(node.province), findCity(node.city)]
                    .filter(Boolean)
                    .join(ta("، ")),
                filter: "Multi",
              },
              owner: {
                name: ta("مالک"),
                value: (node) =>
                  [node.ownerName, node.ownerPhone].filter(Boolean).join(" - "),
                filter: "Text",
              },
              rejectReason: {
                name: ta("دلیل رد"),
                value: (node) => node.rejectReason || "",
                filter: "Text",
              },
              submittedBy: {
                name: ta("ثبت کننده"),
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
                filter: "Text",
              },
              submittedAt: {
                name: ta("تاریخ ثبت"),
                value: (node) => new Date(node.submittedAt),
                filter: "Date",
              },
              actions: {
                name: ta("عملیات"),
                width: 150,
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
                          "DeleteHospitalAdditionRequest",
                          <DeleteHospitalAdditionRequestPopup
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

export default AdminManageHospitalAdditionsPage;
