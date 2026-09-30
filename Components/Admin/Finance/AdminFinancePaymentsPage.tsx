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
import ResolvePaymentPopup from "./ResolvePaymentPopup";
import {
  IFinanceUser,
  paymentPurposeDict,
  failureReasonLabel,
  paymentStatusDict,
  userLabel,
} from "./adminFinance";
import { ta } from "@/Components/Admin/i18n/adminText";

export interface IAdminPaymentRow {
  _id: string;
  user: IFinanceUser | null;
  amount: number;
  purpose: string;
  status: string;
  refNum?: string;
  rrn?: string;
  maskedPan?: string;
  failureReason?: string;
  createdAt?: string;
  resolvedAt?: string;
  resolutionNote?: string;
  resolvedBy?: { phone?: string; username?: string } | null;
}

// Online gateway (SEP) payments. `?status=needsReview` is the dashboard's
// "payments needing review" queue - the only rows an admin acts on.
const AdminFinancePaymentsPage = () => {
  const status = useSearchParams().get("status") || "";
  const router = useRouter();
  const { setPopup } = usePopup();
  const { data, error, mutate } = useSWR<IAdminPaymentRow[]>(
    `${API}/admin/finance/payments${status ? `?status=${encodeURIComponent(status)}` : ""}`,
    (url: string) =>
      fetcher({ url }).then((res) => (Array.isArray(res.data) ? res.data : [])),
  );
  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle
          title={
            status === "needsReview"
              ? ta("پرداخت‌های نیازمند بررسی")
              : ta("پرداخت‌های درگاه")
          }
          actions={[
            status === "needsReview"
              ? {
                  title: ta("همه‌ی پرداخت‌ها"),
                  action: () => router.push(adminPath("/finance/payments")),
                }
              : {
                  title: ta("فقط نیازمند بررسی"),
                  action: () =>
                    router.push(
                      adminPath("/finance/payments?status=needsReview"),
                    ),
                },
          ]}
        >
          <Table
            name="AdminFinancePayments"
            data={data}
            renderer={{
              user: {
                name: ta("پرداخت‌کننده"),
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
                name: ta("مبلغ (تومان)"),
                value: (node) => node.amount,
                component: (node) => currencize(node.amount || 0),
                filter: "Number",
              },
              purpose: {
                name: ta("بابت"),
                value: (node) =>
                  paymentPurposeDict[node.purpose] || node.purpose,
                filter: "Set",
              },
              status: {
                name: ta("وضعیت"),
                value: (node) => paymentStatusDict[node.status] || node.status,
                filter: "Set",
              },
              rrn: {
                name: ta("کد پیگیری"),
                value: (node) => node.rrn || node.refNum || "—",
                filter: "Text",
              },
              maskedPan: {
                name: ta("کارت"),
                value: (node) => node.maskedPan || "—",
              },
              resolutionNote: {
                name: ta("علت / نتیجه"),
                value: (node) =>
                  node.resolvedAt
                    ? `${node.resolvedBy?.phone || node.resolvedBy?.username || ""}: ${node.resolutionNote || ""}`
                    : failureReasonLabel(node.failureReason),
              },
              createdAt: {
                name: ta("تاریخ"),
                value: (node) =>
                  node.createdAt ? new Date(node.createdAt) : undefined,
                filter: "Date",
              },
              actions: {
                name: ta("عملیات"),
                component: (node) =>
                  node.status === "needsReview" ? (
                    <TableActions>
                      <Button
                        size="S"
                        onClick={() =>
                          setPopup(
                            "ResolvePayment",
                            <ResolvePaymentPopup node={node} mutate={mutate} />,
                          )
                        }
                      >
                        {ta("رسیدگی")}
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

export default AdminFinancePaymentsPage;
