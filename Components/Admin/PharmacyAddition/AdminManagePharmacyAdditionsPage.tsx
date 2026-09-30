"use client";

import { useCallback } from "react";
import useSWR from "swr";
import { additionRequestStatusDict } from "@/Components/DoctorPanel/Hospital/DoctorHospitalAdditionsTab";
import { IPharmacyAdditionRequest } from "@/Components/DoctorPanel/Pharmacy/DoctorPharmacyRequestsTab";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import { adminPath } from "@/Components/helpers/adminPath";
import { findCity } from "@/Components/Enums/Cities";
import { findProvince } from "@/Components/Enums/Provinces";
import usePopup from "@/Components/Hooks/usePopup";
import CheckIcon from "@/Components/Icons/CheckIcon";
import GarbageIcon from "@/Components/Icons/GarbageIcon";
import HandleLoading from "../UI/HandleLoading";
import WithTitle from "../UI/WithTitle";
import Table from "../UI/Table";
import InlineLink from "../UI/InlineLink";
import TableActions from "../UI/TableActions";
import IconButton from "../UI/IconButton";
import { getDoctorProfileLabel } from "../Lib/LabelGetters";
import RequestActionsPopup from "../Requests/RequestActionsPopup";
import { AdditionApproveButton } from "../Requests/RequestApproveButtons";
import useOpenFromQuery from "../Requests/useOpenFromQuery";
import DeleteShitPopup from "../UI/DeleteShitPopup";
import { ta } from "@/Components/Admin/i18n/adminText";

// Doctors' "add the pharmacy I work with" requests (2026-09): they could be
// submitted from the doctor panel, but no admin page listed them.
const AdminManagePharmacyAdditionsPage = () => {
  const { data, error, mutate } = useSWR<
    IPharmacyAdditionRequest<{ Doctor: Record<never, never> }>[]
  >(`${API}/auto/pharmacyaddition`, (url: string) =>
    fetcher({ url }).then((res) =>
      Array.isArray(res.data?.data) ? res.data.data : [],
    ),
  );

  const { setPopup } = usePopup();

  const openActions = useCallback(
    (node: IPharmacyAdditionRequest<{ Doctor: Record<never, never> }>) =>
      setPopup(
        "AdditionRequestActions",
        <RequestActionsPopup
          title={ta("درخواست افزودن داروخانه")}
          group="addition"
          kind="pharmacy"
          node={node}
          mutate={mutate}
          approve={
            <AdditionApproveButton
              kind="pharmacy"
              requestId={node._id}
              label={ta("ایجاد داروخانه از این درخواست")}
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
        <WithTitle title={ta("درخواست های اضافه شدن داروخانه")}>
          <Table
            name="AdminManagePharmacyAdditionRequests"
            data={data}
            renderer={{
              name: {
                name: ta("نام داروخانه"),
                value: (node) => node.name,
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
              address: {
                name: ta("نشانی"),
                value: (node) => node.address,
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
                value: (node) =>
                  node.submittedAt ? new Date(node.submittedAt) : undefined,
                filter: "Date",
              },
              actions: {
                name: ta("عملیات"),
                width: 120,
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
                          "DeletePharmacyAdditionRequest",
                          <DeleteShitPopup
                            nodeId={node._id}
                            modelName="pharmacyaddition"
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

export default AdminManagePharmacyAdditionsPage;
