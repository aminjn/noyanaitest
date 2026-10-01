"use client";

import { useSearchParams } from "next/navigation";
import { useRouter } from "@/Components/i18n/navigation";
import { API } from "@/Components/config";
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
import {
  FinanceFilterBar,
  FinancePager,
  useFinanceFilters,
  useFinanceList,
} from "./FinanceListControls";
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
const PAYMENTS_PATH = `${API}/admin/finance/payments`;

const AdminFinancePaymentsPage = () => {
  const status = useSearchParams().get("status") || "";
  const router = useRouter();
  const { setPopup } = usePopup();
  const state = useFinanceFilters({ status }, "purpose");
  const { data: list, error, mutate, isValidating } =
    useFinanceList<IAdminPaymentRow>(PAYMENTS_PATH, state.query, state.page);
  const data = list?.rows;
  return (
    <HandleLoading data={!!list} error={error}>
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
          <FinanceFilterBar
            state={state}
            searchPlaceholder={ta("موبایل، نام یا کد پیگیری بانک...")}
            status={{ title: ta("وضعیت"), options: paymentStatusDict }}
            extra={{ title: ta("بابت"), options: paymentPurposeDict }}
            exportPath={PAYMENTS_PATH}
            exportName="payments"
          />
          <Table
toolbar={false}
            name="AdminFinancePayments"
            data={data}
            exportable={false}
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
          <FinancePager
            total={list.total}
            page={state.page}
            limit={list.limit}
            setPage={state.setPage}
            stale={isValidating}
          />
        </WithTitle>
      )}
    </HandleLoading>
  );
};

export default AdminFinancePaymentsPage;
