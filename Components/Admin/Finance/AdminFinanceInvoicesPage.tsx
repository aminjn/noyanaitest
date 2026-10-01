"use client";

import { API } from "@/Components/config";
import { currencize } from "@/Components/helpers/currencize";
import { adminPath } from "@/Components/helpers/adminPath";
import HandleLoading from "../UI/HandleLoading";
import WithTitle from "../UI/WithTitle";
import Table from "../UI/Table";
import InlineLink from "../UI/InlineLink";
import { IFinanceUser, userLabel } from "./adminFinance";
import {
  FinanceFilterBar,
  FinancePager,
  useFinanceFilters,
  useFinanceList,
} from "./FinanceListControls";
import { ta } from "@/Components/Admin/i18n/adminText";

interface IAdminInvoiceRow {
  _id: string;
  user: IFinanceUser | null;
  patient: { _id: string; name: string; nationalId: string } | null;
  doctor: { _id: string; name: string } | null;
  sessionDate: string;
  sessionKind: string;
  total: number;
  payable: boolean;
  paid: boolean;
  paidAt?: string | null;
  paymentMethod: string;
  submittedAt?: string;
}

const INVOICES_PATH = `${API}/admin/finance/invoices`;

const paidDict: Record<string, string> = {
  get paid() {
    return ta("پرداخت‌شده");
  },
  get unpaid() {
    return ta("پرداخت‌نشده");
  },
};

const sessionKindDict: Record<string, string> = {
  get inPerson() {
    return ta("حضوری");
  },
  get textChat() {
    return ta("گفتگوی متنی");
  },
  get sipCall() {
    return ta("تماس تلفنی");
  },
  get voiceCall() {
    return ta("تماس صوتی");
  },
  get videoCall() {
    return ta("تماس تصویری");
  },
  get phone() {
    return ta("تلفنی");
  },
};

const paymentMethodDict: Record<string, string> = {
  get Manual() {
    return ta("دستی");
  },
};

// Visit invoices of the older booking flow (Models/Invoice.ts) with their
// manual checkout - read-only, for support and accounting. Server-paged with
// a CSV export of the current filter.
const AdminFinanceInvoicesPage = () => {
  const state = useFinanceFilters();
  const { data: list, error, isValidating } = useFinanceList<IAdminInvoiceRow>(
    INVOICES_PATH,
    state.query,
    state.page,
  );
  const data = list?.rows;
  return (
    <HandleLoading data={!!list} error={error}>
      {!!data && (
        <WithTitle title={ta("صورتحساب‌ها")}>
          <FinanceFilterBar
            state={state}
            searchPlaceholder={ta("موبایل، نام یا نام کاربری...")}
            status={{ title: ta("پرداخت"), options: paidDict }}
            exportPath={INVOICES_PATH}
            exportName="invoices"
          />
          <Table
toolbar={false}
            name="AdminFinanceInvoices"
            data={data}
            exportable={false}
            renderer={{
              patient: {
                name: ta("بیمار"),
                value: (node) => node.patient?.name || "—",
                filter: "Text",
              },
              user: {
                name: ta("حساب کاربری"),
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
              doctor: {
                name: ta("پزشک"),
                value: (node) => node.doctor?.name || "—",
                filter: "Text",
                component: (node) =>
                  node.doctor ? (
                    <InlineLink href={adminPath(`/doctorprofile/${node.doctor._id}`)}>
                      {node.doctor.name || "—"}
                    </InlineLink>
                  ) : (
                    "—"
                  ),
              },
              sessionKind: {
                name: ta("نوع ویزیت"),
                value: (node) =>
                  sessionKindDict[node.sessionKind] || node.sessionKind || "—",
                filter: "Set",
              },
              sessionDate: {
                name: ta("تاریخ ویزیت"),
                value: (node) => node.sessionDate || "—",
              },
              total: {
                name: ta("مبلغ (تومان)"),
                value: (node) => node.total,
                component: (node) => currencize(node.total || 0),
                filter: "Number",
              },
              paid: {
                name: ta("پرداخت"),
                value: (node) =>
                  node.paid
                    ? ta("پرداخت‌شده (${1})", [
                        paymentMethodDict[node.paymentMethod] || node.paymentMethod || "—",
                      ])
                    : node.payable
                      ? ta("پرداخت‌نشده")
                      : ta("غیرقابل پرداخت"),
                filter: "Set",
              },
              paidAt: {
                name: ta("تاریخ پرداخت"),
                value: (node) => (node.paidAt ? new Date(node.paidAt) : undefined),
                filter: "Date",
              },
              submittedAt: {
                name: ta("تاریخ صدور"),
                value: (node) =>
                  node.submittedAt ? new Date(node.submittedAt) : undefined,
                filter: "Date",
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

export default AdminFinanceInvoicesPage;
