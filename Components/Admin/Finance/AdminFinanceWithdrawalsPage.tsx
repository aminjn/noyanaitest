"use client";

import useSWR from "swr";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/Components/i18n/navigation";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import { currencize } from "@/Components/helpers/currencize";
import { adminPath } from "@/Components/helpers/adminPath";
import usePopup from "@/Components/Hooks/usePopup";
import HandleLoading from "../UI/HandleLoading";
import WithTitle from "../UI/WithTitle";
import Table from "../UI/Table";
import InlineLink from "../UI/InlineLink";
import TableActions from "../UI/TableActions";
import Button from "@/Components/UI/Button";
import DecideWithdrawalPopup from "./DecideWithdrawalPopup";
import { IFinanceUser, userLabel } from "./adminFinance";

export interface IAdminWithdrawalRow {
  _id: string;
  user: IFinanceUser | null;
  amount: number;
  iban: string;
  holderName: string;
  status: "pending" | "paid" | "rejected" | "cancelled";
  trackingCode?: string;
  adminNote?: string;
  createdAt?: string;
  decidedAt?: string;
  decidedBy?: { phone?: string; username?: string } | null;
}

const statusDict: Record<IAdminWithdrawalRow["status"], string> = {
  pending: "در انتظار واریز",
  paid: "واریز شد",
  rejected: "رد شد",
  cancelled: "لغو توسط کاربر",
};

// Every user's wallet -> bank withdrawal requests (2026-09). The amount is
// already held; the admin transfers it (Paya / Satna) and records the
// reference, or rejects it and it returns to the wallet.
const AdminFinanceWithdrawalsPage = () => {
  const status = useSearchParams().get("status") || "";
  const router = useRouter();
  const { setPopup } = usePopup();
  const { data, error, mutate } = useSWR<IAdminWithdrawalRow[]>(
    `${API}/admin/finance/withdrawals${status ? `?status=${encodeURIComponent(status)}` : ""}`,
    (url: string) =>
      fetcher({ url }).then((res) => (Array.isArray(res.data) ? res.data : [])),
  );
  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle
          title={
            status === "pending"
              ? "برداشت‌های در انتظار واریز"
              : "درخواست‌های برداشت"
          }
          actions={[
            status === "pending"
              ? {
                  title: "همه‌ی درخواست‌ها",
                  action: () => router.push(adminPath("/finance/withdrawals")),
                }
              : {
                  title: "فقط در انتظار",
                  action: () =>
                    router.push(
                      adminPath("/finance/withdrawals?status=pending"),
                    ),
                },
          ]}
        >
          <Table
            name="AdminFinanceWithdrawals"
            data={data}
            renderer={{
              user: {
                name: "کاربر",
                value: (node) => userLabel(node.user),
                filter: "Text",
                component: (node) =>
                  node.user ? (
                    <InlineLink href={adminPath(`/user/${node.user._id}`)}>
                      {userLabel(node.user)}
                    </InlineLink>
                  ) : (
                    "—"
                  ),
              },
              amount: {
                name: "مبلغ (تومان)",
                value: (node) => node.amount,
                component: (node) => currencize(node.amount || 0),
                filter: "Number",
              },
              iban: { name: "شبا", value: (node) => node.iban, filter: "Text" },
              holderName: {
                name: "صاحب حساب",
                value: (node) => node.holderName,
                filter: "Text",
              },
              status: {
                name: "وضعیت",
                value: (node) => statusDict[node.status] || node.status,
                filter: "Set",
              },
              trackingCode: {
                name: "کد پیگیری / دلیل",
                value: (node) => node.trackingCode || node.adminNote || "—",
              },
              createdAt: {
                name: "تاریخ درخواست",
                value: (node) =>
                  node.createdAt ? new Date(node.createdAt) : undefined,
                filter: "Date",
              },
              actions: {
                name: "عملیات",
                component: (node) =>
                  node.status === "pending" ? (
                    <TableActions>
                      <Button
                        size="S"
                        onClick={() =>
                          setPopup(
                            "DecideWithdrawal",
                            <DecideWithdrawalPopup
                              node={node}
                              mutate={mutate}
                            />,
                          )
                        }
                      >
                        رسیدگی
                      </Button>
                    </TableActions>
                  ) : null,
              },
            }}
          />
        </WithTitle>
      )}
    </HandleLoading>
  );
};

export default AdminFinanceWithdrawalsPage;
