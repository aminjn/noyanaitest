"use client";

import useSWR from "swr";
import classes from "./DashboardManageTransactionsPage.module.css";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import Table from "@/Components/Admin/UI/Table";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import FormatDate from "@/Components/UI/FormatDate";
import { currencize } from "@/Components/helpers/currencize";
import InlineLink from "@/Components/Admin/UI/InlineLink";
import { getDoctorProfileLabel } from "@/Components/Admin/Lib/LabelGetters";
import { ITransaction } from "@/Components/Dashboard/Booking/DashboardManageBookingsPage";
import { IWallet } from "@/Components/Booking/Finalize/FinalizeBookingPage";
import Badge from "@/Components/UI/Badge";

const NS: ContentNamespace[] = ["common", "dashboardTransaction"];

const DashboardManageTransactionsPage = () => {
  const getContent = useScopedLocale(NS);

  const { data: wallet } = useSWR<IWallet>(`${API}/user/wallet`, (url: string) =>
    fetcher({ url }).then((res) => res.data),
  );

  const { data, error } = useSWR<
    ITransaction<{ Reservation: { Doctor: Record<never, never> } }>[]
  >(`${API}/user/transaction`, (url: string) =>
    fetcher({ url }).then((res) => res.data),
  );

  return (
    <div className={classes.main}>
      {!!wallet && (
        <div className={classes.balance}>
          <span>{getContent("currentBalance")}</span>
          <span className={classes.balanceValue}>
            {currencize(wallet.balance)} {getContent("toman")}
          </span>
        </div>
      )}
      <HandleLoading data={!!data} error={error}>
        {!!data && (
          <Table
            name="DashboardManageTransactions"
            data={data}
            renderer={{
              createdAt: {
                name: getContent("createdAt"),
                value: (node) => new Date(node.createdAt),
                filter: "Date",
                component: (node) => <FormatDate value={node.createdAt} />,
              },
              amount: {
                name: getContent("amount"),
                value: (node) => node.amount,
                filter: "Number",
                component: (node) => (
                  <Badge color={node.amount >= 0 ? "Success" : "Error"}>
                    {node.amount >= 0 ? "+" : "-"}
                    {currencize(Math.abs(node.amount))} {getContent("toman")}
                  </Badge>
                ),
              },
              reservation: {
                name: getContent("reservation"),
                value: (node) =>
                  node.reservation
                    ? getDoctorProfileLabel(node.reservation.doctor)
                    : "",
                filter: "Text",
                component: (node) =>
                  node.reservation ? (
                    <InlineLink
                      href={`/dashboard/booking/${node.reservation._id}`}
                    >
                      {getDoctorProfileLabel(node.reservation.doctor)}
                    </InlineLink>
                  ) : (
                    getContent("unset")
                  ),
              },
            }}
          />
        )}
      </HandleLoading>
    </div>
  );
};

export default DashboardManageTransactionsPage;
