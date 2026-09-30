"use client";

import { API } from "@/Components/config";
import { IBecomeInsuranceRequest } from "@/Components/Layout/InsurancePanelLayout";
import useSWR from "swr";
import HandleLoading from "../UI/HandleLoading";
import WithTitle from "../UI/WithTitle";
import Table from "../UI/Table";
import InlineLink from "../UI/InlineLink";
import { adminPath } from "@/Components/helpers/adminPath";
import { becomeNodeStatusesDict } from "@/Components/DoctorPanel/DoctorPanelPage";
import TableActions from "../UI/TableActions";
import IconLink from "../UI/IconLink";
import EditIcon from "@/Components/Icons/EditIcon";
import { fetcher } from "@/Components/helpers/fetcher";
import { ta } from "@/Components/Admin/i18n/adminText";

const AdminManageBecomeInsurancesPage = () => {
  const { data, error } = useSWR<
    IBecomeInsuranceRequest<{ User: Record<never, never> }>[]
  >(`${API}/auto/becomeinsurance`, (url: string) =>
    fetcher({ url }).then((res) => res.data.data),
  );

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle title={ta("درخواست های بیمه شدن")}>
          <Table
            name="AdminManageBecomeInsurances"
            data={data}
            renderer={{
              name: {
                name: ta("نام"),
                value: (node) => node.name,
                filter: "Text",
              },
              user: {
                name: ta("کاربر"),
                value: (node) => node.user?.phone || "",
                filter: "Text",
                component: (node) =>
                  !!node.user ? (
                    <InlineLink href={adminPath(`/user/${node.user._id}`)}>
                      {node.user.phone || node.user._id}
                    </InlineLink>
                  ) : (
                    "—"
                  ),
              },
              status: {
                name: ta("وضعیت"),
                value: (node) => becomeNodeStatusesDict[node.status],
                filter: "Set",
              },
              siamCode: {
                name: ta("کد سیام"),
                value: (node) => node.siamCode,
                filter: "Text",
              },
              nationalId: {
                name: ta("کد ملی"),
                value: (node) => node.nationalId,
                filter: "Text",
              },
              createdAt: {
                name: ta("تاریخ ثبت"),
                value: (node) => new Date(node.createdAt),
                filter: "Date",
              },
              actions: {
                name: ta("عملیات"),
                component: (node) => (
                  <TableActions>
                    <IconLink
                      href={adminPath(`/becomeinsurance/${node._id}`)}
                      title={ta("ویرایش")}
                    >
                      <EditIcon />
                    </IconLink>
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

export default AdminManageBecomeInsurancesPage;
