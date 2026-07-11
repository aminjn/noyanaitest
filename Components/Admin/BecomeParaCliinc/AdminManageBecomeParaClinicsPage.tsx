"use client";

import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import { IBecomeParaClinicRequest } from "@/Components/Layout/BecomeParaClinicPage";
import useSWR from "swr";
import HandleLoading from "../UI/HandleLoading";
import WithTitle from "../UI/WithTitle";
import Table from "../UI/Table";
import InlineLink from "../UI/InlineLink";
import FormatDate from "@/Components/UI/FormatDate";
import { becomeNodeStatusesDict } from "@/Components/DoctorPanel/DoctorPanelPage";
import TableActions from "../UI/TableActions";
import IconLink from "../UI/IconLink";
import { adminPath } from "@/Components/helpers/adminPath";
import EyeIcon from "@/Components/Icons/EyeIcon";

const AdminManageBecomeParaClinicsPage = () => {
  const { data, error } = useSWR<
    IBecomeParaClinicRequest<{ User: Record<never, never> }>[]
  >(`${API}/auto/becomeParaClinic`, (url: string) =>
    fetcher({ url }).then((res) => res.data.data),
  );

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle title="درخواست های پاراکلینیک شدن">
          <Table
            data={data}
            name="AdminManageBecomeParaClinicRequests"
            renderer={{
              name: { name: "نام", value: (node) => node.name, filter: "Text" },
              user: {
                name: "کاربر",
                value: (node) => node.user.phone,
                filter: "Text",
                component: (node) => (
                  <InlineLink href={`${API}/user/${node.user._id}`}>
                    {node.user.phone}
                  </InlineLink>
                ),
              },
              createdAt: {
                name: "زمان ایجاد",
                value: (node) => new Date(node.createdAt),
                filter: "Date",
                component: (node) => <FormatDate time value={node.createdAt} />,
              },
              status: {
                name: "وضعیت",
                value: (node) => becomeNodeStatusesDict[node.status],
                filter: "Set",
              },
              actions: {
                name: "عملیات",
                component: (node) => (
                  <TableActions>
                    <IconLink href={adminPath(`/becomeParaClinic/${node._id}`)}>
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
