"use client";

import { API } from "@/Components/config";
import { currencize } from "@/Components/helpers/currencize";
import { adminPath } from "@/Components/helpers/adminPath";
import HandleLoading from "../UI/HandleLoading";
import WithTitle from "../UI/WithTitle";
import Table from "../UI/Table";
import InlineLink from "../UI/InlineLink";
import { userLabel } from "../Finance/adminFinance";
import {
  FinanceFilterBar,
  FinancePager,
  useFinanceFilters,
  useFinanceList,
} from "../Finance/FinanceListControls";
import { adminIntlTag, ta } from "@/Components/Admin/i18n/adminText";
import classes from "./AdminSubscriptionsTab.module.css";

interface ISubscriptionRow {
  _id: string;
  kind: string;
  provider: {
    _id: string;
    name: string;
    owner: { _id: string; phone: string; username: string } | null;
  };
  plan: string;
  modules: number;
  startedAt?: string | null;
  expiresAt?: string | null;
  daysLeft: number | null;
  status: "active" | "expiring" | "expired";
  paid: boolean;
  lastPaidAmount: number;
  lastPaidAt?: string | null;
}

type Counts = Partial<Record<"all" | "active" | "expiring" | "expired" | "unpaid", number>>;

const SUBSCRIPTIONS_PATH = `${API}/admin/finance/subscriptions`;

const kindDict: Record<string, string> = {
  get doctorprofile() {
    return ta("پزشک");
  },
  get clinic() {
    return ta("کلینیک");
  },
  get hospital() {
    return ta("بیمارستان");
  },
  get paraClinic() {
    return ta("پاراکلینیک");
  },
  get pharmacy() {
    return ta("داروخانه");
  },
  get insurance() {
    return ta("بیمه");
  },
};

const statusDict: Record<string, string> = {
  get active() {
    return ta("فعال");
  },
  get expiring() {
    return ta("رو به پایان (۱۴ روز)");
  },
  get expired() {
    return ta("منقضی");
  },
  get unpaid() {
    return ta("بدون پرداخت (رایگان یا اعطایی)");
  },
};

// Every provider's current plan in one list (2026-10, «پلن‌ها و مجوزها» >
// اشتراک‌ها): which plan, since when, until when, what runs out within 14
// days, and which periods were never paid for (a free tier or set by an
// admin). Server-paged, soonest expiry first, CSV export of the filter.
const AdminSubscriptionsTab = () => {
  const state = useFinanceFilters({}, "kind");
  const { data: list, error, isValidating } = useFinanceList<ISubscriptionRow>(
    SUBSCRIPTIONS_PATH,
    state.query,
    state.page,
  );
  const data = list?.rows;
  const counts = (list?.body.counts || {}) as Counts;
  const num = new Intl.NumberFormat(adminIntlTag());
  const dateFormat = new Intl.DateTimeFormat(adminIntlTag(), { dateStyle: "medium" });
  const tabs: { key: string; title: string; count?: number }[] = [
    { key: "", title: ta("همه"), count: counts.all },
    { key: "expiring", title: statusDict.expiring, count: counts.expiring },
    { key: "expired", title: statusDict.expired, count: counts.expired },
    { key: "unpaid", title: statusDict.unpaid, count: counts.unpaid },
    { key: "active", title: statusDict.active, count: counts.active },
  ];
  return (
    <HandleLoading data={!!list} error={error}>
      {!!data && (
        <WithTitle title={ta("اشتراک‌ها")}>
          <div className={classes.tabs} role="tablist">
            {tabs.map((tab) => (
              <button
                key={tab.key || "all"}
                type="button"
                role="tab"
                aria-selected={state.filters.status === tab.key}
                className={`${classes.tab} ${state.filters.status === tab.key ? classes.tabActive : ""}`}
                onClick={() => state.set({ status: tab.key })}
              >
                <span>{tab.title}</span>
                {typeof tab.count === "number" && (
                  <span className={classes.tabCount}>{num.format(tab.count)}</span>
                )}
              </button>
            ))}
          </div>
          <FinanceFilterBar
            state={state}
            dates={false}
            searchPlaceholder={ta("نام ارائه‌دهنده، طرح یا موبایل مالک...")}
            extra={{ title: ta("نوع ارائه‌دهنده"), options: kindDict }}
            exportPath={SUBSCRIPTIONS_PATH}
            exportName="subscriptions"
          />
          <Table
            name="AdminSubscriptions"
            data={data}
            exportable={false}
            renderer={{
              provider: {
                name: ta("ارائه‌دهنده"),
                value: (node) => node.provider?.name || "—",
                filter: "Text",
                component: (node) =>
                  node.provider?._id ? (
                    <InlineLink href={adminPath(`/${node.kind}/${node.provider._id}`)}>
                      {node.provider.name || "—"}
                    </InlineLink>
                  ) : (
                    "—"
                  ),
              },
              kind: {
                name: ta("نوع"),
                value: (node) => kindDict[node.kind] || node.kind,
                filter: "Set",
              },
              owner: {
                name: ta("مالک"),
                value: (node) =>
                  node.provider?.owner
                    ? node.provider.owner.username || node.provider.owner.phone
                    : "—",
                component: (node) =>
                  node.provider?.owner ? (
                    <InlineLink href={adminPath(`/user/${node.provider.owner._id}`)}>
                      {userLabel(node.provider.owner)}
                    </InlineLink>
                  ) : (
                    "—"
                  ),
              },
              plan: {
                name: ta("طرح"),
                value: (node) => node.plan || "—",
                filter: "Set",
              },
              startedAt: {
                name: ta("شروع"),
                value: (node) => (node.startedAt ? new Date(node.startedAt) : undefined),
                filter: "Date",
              },
              expiresAt: {
                name: ta("پایان"),
                value: (node) => (node.expiresAt ? new Date(node.expiresAt) : undefined),
                filter: "Date",
                component: (node) =>
                  node.expiresAt && !isNaN(new Date(node.expiresAt).getTime())
                    ? `${dateFormat.format(new Date(node.expiresAt))}${
                        node.daysLeft !== null && node.daysLeft >= 0
                          ? ` (${ta("${1} روز", [num.format(node.daysLeft)])})`
                          : ""
                      }`
                    : ta("بدون پایان"),
              },
              status: {
                name: ta("وضعیت"),
                value: (node) => statusDict[node.status] || node.status,
                filter: "Set",
                component: (node) => (
                  <span className={`${classes.badge} ${classes[`badge_${node.status}`] || ""}`}>
                    {statusDict[node.status] || node.status}
                  </span>
                ),
              },
              paid: {
                name: ta("پرداخت این دوره"),
                value: (node) =>
                  node.paid
                    ? ta("پرداخت‌شده (${1} تومان)", [currencize(node.lastPaidAmount || 0)])
                    : ta("بدون پرداخت"),
                filter: "Set",
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

export default AdminSubscriptionsTab;
