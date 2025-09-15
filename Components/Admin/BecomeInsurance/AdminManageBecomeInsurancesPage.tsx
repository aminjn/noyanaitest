"use client";

import { API } from "@/Components/config";
import { IBecomeInsuranceRequest } from "@/Components/Layout/InsurancePanelLayout";
import useSWR from "swr";
import HandleLoading from "../UI/HandleLoading";
import WithTitle from "../UI/WithTitle";
import Table from "../UI/Table";
import FormatDate from "@/Components/UI/FormatDate";
import InlineLink from "../UI/InlineLink";
import { adminPath } from "@/Components/helpers/adminPath";
import { becomeNodeStatusesDict } from "@/Components/DoctorPanel/DoctorPanelPage";
import TableActions from "../UI/TableActions";
import IconLink from "../UI/IconLink";
import EditIcon from "@/Components/Icons/EditIcon";
import { fetcher } from "@/Components/helpers/fetcher";

const AdminManageBecomeInsurancesPage = () => {
  const { data, error } = useSWR<IBecomeInsuranceRequest<{ user: true }>[]>(
    `${API}/auto/becomeinsurance`,
    (url: string) => fetcher({ url }).then((res) => res.data.data)
  );

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle title="درخواست های بیمه شدن">
          <Table
            name="AdminManageBecomeInsurances"
            data={data}
            renderer={{
              createdAt: {
                name: "تاریخ ایجاد",
                value: (node) => new Date(node.createdAt),
                filter: "Date",
                component: (node) => <FormatDate value={node.createdAt} />,
              },
              user: {
                name: "یوزر",
                value: (node) => node.user.phone,
                filter: "Text",
                component: (node) => (
                  <InlineLink href={adminPath(`/user/${node.user._id}`)}>
                    {node.user.phone || node.user._id}
                  </InlineLink>
                ),
              },
              name: {
                name: "نام",
                value: (node) => node.name,
                filter: "Text",
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
                    <IconLink href={adminPath(`/becomeinsurance/${node._id}`)}>
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
