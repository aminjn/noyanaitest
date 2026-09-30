"use client";

import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import { IBecomeParaClinicRequest } from "@/Components/Layout/BecomeParaClinicPage";
import useSWR from "swr";
import HandleLoading from "../UI/HandleLoading";
import WithTitle from "../UI/WithTitle";
import Table from "../UI/Table";
import InlineLink from "../UI/InlineLink";
import { becomeNodeStatusesDict } from "@/Components/DoctorPanel/DoctorPanelPage";
import TableActions from "../UI/TableActions";
import IconLink from "../UI/IconLink";
import { adminPath } from "@/Components/helpers/adminPath";
import EyeIcon from "@/Components/Icons/EyeIcon";
import { ta } from "@/Components/Admin/i18n/adminText";

const AdminManageBecomeParaClinicsPage = () => {
  const { data, error } = useSWR<
    IBecomeParaClinicRequest<{ User: Record<never, never> }>[]
  >(`${API}/auto/becomeParaClinic`, (url: string) =>
    fetcher({ url }).then((res) => res.data.data),
  );

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle title={ta("درخواست های پاراکلینیک شدن")}>
          <Table
            data={data}
            name="AdminManageBecomeParaClinicRequests"
            renderer={{
              name: { name: ta("نام"), value: (node) => node.name, filter: "Text" },
              status: {
                name: ta("وضعیت"),
                value: (node) => becomeNodeStatusesDict[node.status],
                filter: "Set",
              },
              user: {
                name: ta("کاربر"),
                value: (node) => node.user?.phone,
                filter: "Text",
                component: (node) =>
                  node.user ? (
                    <InlineLink href={adminPath(`/user/${node.user._id}`)}>
                      {node.user.phone}
                    </InlineLink>
                  ) : (
                    "—"
                  ),
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
                      href={adminPath(`/becomeParaClinic/${node._id}`)}
                      title={ta("مشاهده")}
                    >
                      <EyeIcon />
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

export default AdminManageBecomeParaClinicsPage;
