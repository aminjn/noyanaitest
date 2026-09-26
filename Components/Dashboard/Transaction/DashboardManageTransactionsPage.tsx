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
import Button from "@/Components/UI/Button";
import usePopup from "@/Components/Hooks/usePopup";
import WalletChargePopup from "@/Components/Payment/WalletChargePopup";
import { usePaymentConfig } from "@/Components/Payment/paymentTypes";

const NS: ContentNamespace[] = [
  "common",
  "dashboardTransaction",
  "onlinePayment",
];

const DashboardManageTransactionsPage = () => {
  const getContent = useScopedLocale(NS);

  const { setPopup } = usePopup();

  // wallet top-up via the SEP gateway (2026-09) - only offered while online
  // payment is enabled in the admin AppConfig
  const { data: paymentConfig } = usePaymentConfig();

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
          {!!paymentConfig?.sepEnabled && (
            <Button
              className={classes.charge}
              variant="Primary"
              mode="Fill"
              size="S"
              radius="Medium"
              onClick={() =>
                setPopup("WalletCharge", <WalletChargePopup />)
              }
            >
              {getContent("chargeWallet")}
            </Button>
          )}
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
                name: getContent("description"),
                value: (node) =>
                  node.reservation
                    ? getDoctorProfileLabel(node.reservation.doctor)
                    : node.gatewayPayment
                      ? getContent("walletTopUp")
                      : node.order
                        ? getContent("order")
                        : "",
                filter: "Text",
                component: (node) =>
                  node.reservation ? (
                    <InlineLink
                      href={`/dashboard/booking/${node.reservation._id}`}
                    >
                      {getDoctorProfileLabel(node.reservation.doctor)}
                    </InlineLink>
                  ) : node.gatewayPayment ? (
                    <InlineLink href={`/payment/${node.gatewayPayment}`}>
                      {getContent("walletTopUp")}
                    </InlineLink>
                  ) : node.order ? (
                    <InlineLink href={`/order/${node.order}`}>
                      {getContent("order")}
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
