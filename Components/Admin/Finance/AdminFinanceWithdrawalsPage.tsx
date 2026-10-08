"use client";

import { useSearchParams } from "next/navigation";
import { useRouter } from "@/Components/i18n/navigation";
import { API } from "@/Components/config";
import { currencize } from "@/Components/helpers/currencize";
import { adminPath } from "@/Components/helpers/adminPath";
import usePopup from "@/Components/Hooks/usePopup";
import useUser from "@/Components/Hooks/useUser";
import useAccessLevel from "@/Components/Hooks/useAccessLevel";
import HandleLoading from "../UI/HandleLoading";
import WithTitle from "../UI/WithTitle";
import Table from "../UI/Table";
import InlineLink from "../UI/InlineLink";
import TableActions from "../UI/TableActions";
import Button from "@/Components/UI/Button";
import DecideWithdrawalPopup from "./DecideWithdrawalPopup";
import { IFinanceUser, userLabel } from "./adminFinance";
import {
  FinanceFilterBar,
  FinancePager,
  useFinanceFilters,
  useFinanceList,
} from "./FinanceListControls";
import { ta } from "@/Components/Admin/i18n/adminText";

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
  // a clinic's / hospital's own wallet (one wallet per centre); unset: the
  // user's personal wallet
  centreKind?: "clinic" | "hospital";
  centre?: string;
  centreName?: string;
}

// which wallet a request is held from
export const withdrawalWalletLabel = (node: Pick<IAdminWithdrawalRow, "centreKind" | "centreName">) =>
  node.centreKind === "clinic"
    ? ta("کلینیک: ${1}", [node.centreName || "—"])
    : node.centreKind === "hospital"
      ? ta("بیمارستان: ${1}", [node.centreName || "—"])
      : ta("کیف پول شخصی");

const statusDict: Record<IAdminWithdrawalRow["status"], string> = {
  get pending() {
  return ta("در انتظار واریز");
},
  get paid() {
  return ta("واریز شد");
},
  get rejected() {
  return ta("رد شد");
},
  get cancelled() {
  return ta("لغو توسط کاربر");
},
};

// Every user's wallet -> bank withdrawal requests (2026-09). The amount is
// already held; the admin transfers it (Paya / Satna) and records the
// reference, or rejects it and it returns to the wallet.
const WITHDRAWALS_PATH = `${API}/admin/finance/withdrawals`;

const AdminFinanceWithdrawalsPage = () => {
  const status = useSearchParams().get("status") || "";
  const router = useRouter();
  const { setPopup } = usePopup();
  const { user: viewer } = useUser();
  const hasAccess = useAccessLevel();
  // deciding needs Finance "update" (adminRouter); read-only staff get no
  // button that would answer 403
  const canAct = viewer?.role === "admin" || hasAccess("Finance", "update");
  const state = useFinanceFilters({ status });
  const { data: list, error, mutate, isValidating } =
    useFinanceList<IAdminWithdrawalRow>(WITHDRAWALS_PATH, state.query, state.page);
  const data = list?.rows;
  const pending = list?.body.pending as { count?: number; sum?: number } | undefined;
  return (
    <HandleLoading data={!!list} error={error}>
      {!!data && (
        <WithTitle
          title={
            status === "pending"
              ? ta("برداشت‌های در انتظار واریز")
              : ta("درخواست‌های برداشت")
          }
          actions={[
            status === "pending"
              ? {
                  title: ta("همه‌ی درخواست‌ها"),
                  action: () => router.push(adminPath("/finance/withdrawals")),
                }
              : {
                  title: ta("فقط در انتظار"),
                  action: () =>
                    router.push(
                      adminPath("/finance/withdrawals?status=pending"),
                    ),
                },
          ]}
        >
          {!!pending?.count && (
            <p style={{ marginBottom: "1rem" }}>
              {ta("${1} درخواست به مبلغ ${2} تومان در انتظار واریز است.", [String(pending.count), currencize(pending.sum || 0)])}
            </p>
          )}
          <FinanceFilterBar
            state={state}
            searchPlaceholder={ta("موبایل، نام، شبا یا کد پیگیری...")}
            status={{ title: ta("وضعیت"), options: statusDict }}
            exportPath={WITHDRAWALS_PATH}
            exportName="withdrawals"
          />
          <Table
toolbar={false}
            name="AdminFinanceWithdrawals"
            data={data}
            exportable={false}
            renderer={{
              user: {
                name: ta("کاربر"),
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
              wallet: {
                name: ta("کیف پول"),
                value: (node) => withdrawalWalletLabel(node),
                filter: "Set",
              },
              amount: {
                name: ta("مبلغ (تومان)"),
                value: (node) => node.amount,
                component: (node) => currencize(node.amount || 0),
                filter: "Number",
              },
              iban: { name: ta("شبا"), value: (node) => node.iban, filter: "Text" },
              holderName: {
                name: ta("صاحب حساب"),
                value: (node) => node.holderName,
                filter: "Text",
              },
              status: {
                name: ta("وضعیت"),
                value: (node) => statusDict[node.status] || node.status,
                filter: "Set",
              },
              trackingCode: {
                name: ta("کد پیگیری / دلیل"),
                value: (node) => node.trackingCode || node.adminNote || "—",
              },
              createdAt: {
                name: ta("تاریخ درخواست"),
                value: (node) =>
                  node.createdAt ? new Date(node.createdAt) : undefined,
                filter: "Date",
              },
              actions: {
                name: ta("عملیات"),
                component: (node) =>
                  canAct && node.status === "pending" ? (
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

export default AdminFinanceWithdrawalsPage;
