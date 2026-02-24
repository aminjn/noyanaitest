"use client";

import { IBecomeClinicRequest } from "@/Components/ClinicPanel/BecomeClinicPage";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import useSWR from "swr";
import HandleLoading from "../UI/HandleLoading";
import WithTitle from "../UI/WithTitle";
import Table from "../UI/Table";
import InlineLink from "../UI/InlineLink";
import { adminPath } from "@/Components/helpers/adminPath";
import FormatDate from "@/Components/UI/FormatDate";
import { becomeNodeStatusesDict } from "@/Components/DoctorPanel/DoctorPanelPage";
import TableActions from "../UI/TableActions";
import IconLink from "../UI/IconLink";
import EditIcon from "@/Components/Icons/EditIcon";

const AdminManageBecomeClinicsPage = () => {
  const { data, error } = useSWR<IBecomeClinicRequest<{ user: true }>[]>(
    `${API}/auto/becomeclinic`,
    (url: string) => fetcher({ url }).then((res) => res.data.data),
  );

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle title="درخواست های کلینیک شدن">
          <Table
            data={data}
            name="AdminManageBecomeClinics"
            renderer={{
              user: {
                name: " یوزر",
                value: (node) => (node.user ? node.user.phone : "حذف شده"),
                component: (node) =>
                  node.user ? (
                    <InlineLink href={adminPath(`/user/${node.user._id}`)}>
                      {node.user.phone}
                    </InlineLink>
                  ) : (
                    "حذف شده"
                  ),
                filter: "Text",
              },
              createdAt: {
                name: "تاریخ ایجاد",
                value: (node) => new Date(node.createdAt),
                component: (node) => <FormatDate value={node.createdAt} />,
                filter: "Date",
              },
              status: {
                name: "وضعیت",
                value: (node) => becomeNodeStatusesDict[node.status],
                filter: "Set",
              },
              name: { name: "نام", value: (node) => node.name, filter: "Text" },
              actions: {
                name: "عملیات",
                component: (node) => (
                  <TableActions>
                    <IconLink href={adminPath(`/becomeclinic/${node._id}`)}>
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

export default AdminManageBecomeClinicsPage;
