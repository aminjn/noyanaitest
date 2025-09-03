"use client";

import useSWR from "swr";
import classes from "./DashboardManageinvoicesPage.module.css";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import Table from "@/Components/Admin/UI/Table";
import { IInvoice } from "@/Components/Booking/SelectSessionToReservePopup";
import useLocale from "@/Components/Hooks/useLocale";
import FormatDate from "@/Components/UI/FormatDate";
import { currencize } from "@/Components/helpers/currencize";
import TableActions from "@/Components/Admin/UI/TableActions";
import IconLink from "@/Components/Admin/UI/IconLink";
import EyeIcon from "@/Components/Icons/EyeIcon";

const DashboardManageinvoicesPage = () => {
  const { data, error } = useSWR<IInvoice[]>(
    `${API}/user/invoice`,
    (url: string) => fetcher({ url }).then((res) => res.data)
  );

  const getContent = useLocale();

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <Table
          name="UserManageInvoices"
          data={data}
          renderer={{
            submittedAt: {
              name: getContent("submittedAt"),
              value: (node) => new Date(node.submittedAt),
              component: (node) => <FormatDate value={node.submittedAt} />,
              filter: "Date",
            },
            total: {
              name: getContent("total"),
              value: (node) => node.total,
              component: (node) => currencize(node.total),
              filter: "Number",
            },
            checkout: {
              name: getContent("paymentStatus"),
              value: (node) => getContent(!!node.checkout ? "paid" : "notPaid"),
              filter: "Set",
            },
            actions: {
              name: getContent("actions"),
              component: (node) => (
                <TableActions>
                  <IconLink href={`/dashboard/invoice/${node._id}`}>
                    <EyeIcon />
                  </IconLink>
                </TableActions>
              ),
            },
          }}
        />
      )}
    </HandleLoading>
  );
};

export default DashboardManageinvoicesPage;
