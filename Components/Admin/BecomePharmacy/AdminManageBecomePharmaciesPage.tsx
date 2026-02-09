"use client";

import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import useSWR from "swr";
import HandleLoading from "../UI/HandleLoading";
import { IBecomePharmacyRequest } from "@/Components/PharmacyPanel/BecomePharmacyPage";
import WithTitle from "../UI/WithTitle";
import Table from "../UI/Table";
import FormatDate from "@/Components/UI/FormatDate";
import InlineLink from "../UI/InlineLink";
import { adminPath } from "@/Components/helpers/adminPath";
import { becomeNodeStatusesDict } from "@/Components/DoctorPanel/DoctorPanelPage";
import TableActions from "../UI/TableActions";
import IconLink from "../UI/IconLink";
import EditIcon from "@/Components/Icons/EditIcon";

const AdminManageBecomePharmaciesPage = () => {
  const { data, error } = useSWR<IBecomePharmacyRequest<{ user: true }>[]>(
    `${API}/auto/becomepharmacy`,
    (url: string) => fetcher({ url }).then((res) => res.data.data),
  );

  console.log(data);

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle title="درخواست های داروخانه شدن">
          <Table
            data={data}
            name="AdminManageBecomePharmacies"
            renderer={{
              createdAt: {
                name: "تاریخ ایجاد",
                value: (node) => new Date(node.createdAt),
                filter: "Date",
                component: (node) => <FormatDate value={node.createdAt} />,
              },
              user: {
                name: "یوزر",
                filter: "Text",
                value: (node) => node.user?.phone,
                component: (node) =>
                  node.user ? (
                    <InlineLink href={adminPath(`/user/${node.user._id}`)}>
                      {node.user.phone}
                    </InlineLink>
                  ) : (
                    "حذف شده"
                  ),
              },
              name: { name: "نام", value: (node) => node.name, filter: "Text" },
              status: {
                name: "وضعیت",
                value: (node) => becomeNodeStatusesDict[node.status],
                filter: "Set",
              },
              actions: {
                name: "عملیات",
                component: (node) => (
                  <TableActions>
                    <IconLink href={adminPath(`/becomepharmacy/${node._id}`)}>
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

export default AdminManageBecomePharmaciesPage;
