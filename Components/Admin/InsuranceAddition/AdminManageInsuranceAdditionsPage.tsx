"use client";

import { useCallback } from "react";
import useSWR from "swr";
import classes from "./AdminManageInsuranceAdditionsPage.module.css";
import { IInsuranceAdditionRequest } from "@/Components/DoctorPanel/Insurance/DoctorInsuranceAdditionRequestsTab";
import { additionRequestStatusDict } from "@/Components/DoctorPanel/Clinic/DoctorClinicAdditionsTab";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "../UI/HandleLoading";
import WithTitle from "../UI/WithTitle";
import Table from "../UI/Table";
import { getDoctorProfileLabel } from "../Lib/LabelGetters";
import InlineLink from "../UI/InlineLink";
import { adminPath } from "@/Components/helpers/adminPath";
import TableActions from "../UI/TableActions";
import IconButton from "../UI/IconButton";
import CheckIcon from "@/Components/Icons/CheckIcon";
import GarbageIcon from "@/Components/Icons/GarbageIcon";
import usePopup from "@/Components/Hooks/usePopup";
import RequestActionsPopup from "../Requests/RequestActionsPopup";
import { AdditionApproveButton } from "../Requests/RequestApproveButtons";
import useOpenFromQuery from "../Requests/useOpenFromQuery";
import DeleteInsuranceAdditionRequestPopup from "./DeleteInsuranceAdditionRequestPopup";
import { ta } from "@/Components/Admin/i18n/adminText";

const AdminManageInsuranceAdditionsPage = () => {
  const { data, error, mutate } = useSWR<
    IInsuranceAdditionRequest<{ Doctor: Record<never, never> }>[]
  >(`${API}/auto/insuranceaddition`, (url: string) =>
    fetcher({ url }).then((res) =>
      Array.isArray(res?.data?.data) ? res.data.data : [],
    ),
  );

  const { setPopup } = usePopup();

  const openActions = useCallback(
    (node: IInsuranceAdditionRequest<{ Doctor: Record<never, never> }>) =>
      setPopup(
        "AdditionRequestActions",
        <RequestActionsPopup
          title={ta("درخواست افزودن بیمه")}
          group="addition"
          kind="insurance"
          node={node}
          mutate={mutate}
          approve={
            <AdditionApproveButton
              kind="insurance"
              requestId={node._id}
              label={ta("ایجاد بیمه از درخواست")}
              mutate={mutate}
            />
          }
        >
          <p>{node.name || "—"}</p>
        </RequestActionsPopup>,
      ),
    [setPopup, mutate],
  );

  useOpenFromQuery(data, openActions);

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle title={ta("درخواست های اضافه شدن بیمه")}>
          <Table
            name="AdminManageInsuranceAdditionRequests"
            data={data}
            renderer={{
              name: {
                name: ta("نام بیمه"),
                value: (node) => node.name,
                filter: "Text",
              },
              status: {
                name: ta("وضعیت"),
                value: (node) => additionRequestStatusDict[node.status],
                filter: "Set",
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
                filter: "Text",
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
                name: ta("زمان ثبت"),
                value: (node) => new Date(node.submittedAt),
                filter: "Date",
              },
              description: {
                name: ta("توضیحات"),
                value: (node) => node.description,
                filter: "Text",
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
                          "DeleteInsuranceAdditionRequest",
                          <DeleteInsuranceAdditionRequestPopup
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

export default AdminManageInsuranceAdditionsPage;
