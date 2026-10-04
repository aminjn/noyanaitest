"use client";

import { useState } from "react";
import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import { currencize } from "@/Components/helpers/currencize";
import { adminPath } from "@/Components/helpers/adminPath";
import HandleLoading from "../UI/HandleLoading";
import WithTitle from "../UI/WithTitle";
import Box from "../UI/Box";
import CreateForm from "../UI/CreateForm";
import Table from "../UI/Table";
import InlineLink from "../UI/InlineLink";
import { ILicensePricingEntry } from "../UI/LicensePricingInput";
import { userLabel, IFinanceUser } from "../Finance/adminFinance";
import {
  FinanceFilterBar,
  FinancePager,
  useFinanceFilters,
  useFinanceList,
} from "../Finance/FinanceListControls";
import { adminIntlTag, ta } from "@/Components/Admin/i18n/adminText";
import classes from "./AdminSubscriptionsTab.module.css";

// «اشتراک پرو کاربران» (2026-10): the patients' membership of noyanai-back
// Models/PatientProPlan.ts - its prices (1 / 3 / 12 months with their own
// discounts; launch promotions are set in «تخفیف و پیشنهاد ویژه» with the
// kind «کاربران (پرو)»), each benefit's switch and figure, and the
// subscribers. Every benefit is enforced on the server (Lib/patientPro.ts);
// this form only sets it.

type ProPlan = {
  _id: string;
  displayName: string;
  summary: string;
  isActive: boolean;
  pricing: ILicensePricingEntry[];
  freeAiDailyLimit: number;
  aiEnabled: boolean;
  proAiDailyLimit: number;
  bookingDiscountEnabled: boolean;
  bookingDiscountPercent: number;
  bookingDiscountMax: number;
  bookingDiscountCapAtCommission: boolean;
  familyEnabled: boolean;
  deliveryEnabled: boolean;
  deliveryFreeAbove: number;
  deliveryPercentOff: number;
  cancelEnabled: boolean;
  proFreeCancelHours: number;
  supportEnabled: boolean;
  supportPriority: "low" | "normal" | "high" | "urgent";
};

const PLAN_PATH = `${API}/admin/pro/plan`;
const SUBSCRIBERS_PATH = `${API}/admin/pro/subscribers`;

const ProPlanForm = () => {
  const { data, error, mutate } = useSWR<ProPlan>(PLAN_PATH, (url: string) =>
    fetcher({ url }).then((res) => res?.data),
  );
  const sBasics = ta("فروش و قیمت");
  const sAi = ta("دستیار هوشمند سلامت");
  const sVisit = ta("تخفیف ویزیت");
  const sDelivery = ta("ارسال داروخانه");
  const sOther = ta("لغو رایگان و پشتیبانی");
  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <>
          <Box>
            <p className={classes.note}>
              {ta("تخفیف ویزیت و ارسال را نویان از سهم خودش می‌پردازد: مبلغ تسویه‌ی پزشک و هزینه‌ی ارسالی که به داروخانه می‌رسد تغییر نمی‌کند و تخفیف در دفاتر پلتفرم «تبلیغات و بازاریابی» ثبت می‌شود.")}
            </p>
          </Box>
          <CreateForm<ProPlan>
            defaultValue={data}
            renderer={{
              displayName: { type: "text", title: ta("نام اشتراک"), required: true, section: sBasics },
              summary: {
                type: "area",
                title: ta("معرفی کوتاه (صفحه‌ی /pro)"),
                section: sBasics,
                hint: ta("خالی بماند تا متن پیش‌فرض نمایش داده شود"),
              },
              isActive: { type: "bool", title: ta("در حال فروش"), section: sBasics },
              pricing: { type: "licensePricing", title: ta("قیمت‌ها"), section: sBasics },
              freeAiDailyLimit: {
                type: "number",
                title: ta("پیام روزانه‌ی کاربران رایگان (۰ = بدون محدودیت)"),
                section: sAi,
                hint: ta("برای همه‌ی کاربران بدون پرو اعمال می‌شود، حتی وقتی پرو فروخته نمی‌شود"),
              },
              aiEnabled: { type: "bool", title: ta("مزیت دستیار هوشمند برای پرو"), section: sAi },
              proAiDailyLimit: {
                type: "number",
                title: ta("پیام روزانه‌ی اعضای پرو (۰ = نامحدود)"),
                section: sAi,
              },
              bookingDiscountEnabled: { type: "bool", title: ta("تخفیف ویزیت برای پرو"), section: sVisit },
              bookingDiscountPercent: { type: "number", title: ta("درصد تخفیف ویزیت"), section: sVisit },
              bookingDiscountMax: {
                type: "number",
                price: true,
                title: ta("سقف تخفیف هر ویزیت (تومان، ۰ = بدون سقف)"),
                section: sVisit,
              },
              bookingDiscountCapAtCommission: {
                type: "bool",
                title: ta("تخفیف هرگز بیشتر از کارمزد نویان از همان ویزیت نباشد"),
                section: sVisit,
                hint: ta("با این گزینه هیچ ویزیتی برای نویان زیان‌ده نمی‌شود؛ ویزیت حضوری با کارمزد صفر تخفیف نمی‌گیرد"),
              },
              familyEnabled: {
                type: "bool",
                title: ta("تخفیف برای نوبت‌هایی که عضو برای بستگانش می‌گیرد"),
                section: sVisit,
              },
              deliveryEnabled: { type: "bool", title: ta("تخفیف ارسال برای پرو"), section: sDelivery },
              deliveryFreeAbove: {
                type: "number",
                price: true,
                title: ta("از مبلغ سفارش (تومان، ۰ = همه‌ی سفارش‌ها)"),
                section: sDelivery,
              },
              deliveryPercentOff: {
                type: "number",
                title: ta("درصدی از هزینه‌ی پیک که نویان می‌پردازد (۱۰۰ = ارسال رایگان)"),
                section: sDelivery,
              },
              cancelEnabled: { type: "bool", title: ta("لغو رایگان دیرتر برای پرو"), section: sOther },
              proFreeCancelHours: {
                type: "number",
                title: ta("لغو رایگان تا چند ساعت پیش از نوبت (اعضای پرو)"),
                section: sOther,
                hint: ta("کمتر از مهلت عمومی تنظیمات نوبت‌دهی باشد تا مزیت حساب شود"),
              },
              supportEnabled: { type: "bool", title: ta("پشتیبانی با اولویت برای پرو"), section: sOther },
              supportPriority: {
                type: "select",
                title: ta("اولویت تیکت اعضای پرو"),
                section: sOther,
                options: {
                  get normal() {
                    return ta("عادی");
                  },
                  get high() {
                    return ta("بالا");
                  },
                  get urgent() {
                    return ta("فوری");
                  },
                },
              },
            }}
            hookProps={{
              method: "POST",
              path: PLAN_PATH,
              successCb: () => mutate(),
            }}
          />
        </>
      )}
    </HandleLoading>
  );
};

interface ISubscriberRow {
  _id: string;
  user: IFinanceUser | null;
  days: number;
  startedAt: string;
  expiresAt: string;
  state: "active" | "scheduled" | "expired" | "cancelled";
  daysLeft: number | null;
  listPrice: number;
  paid: number;
  granted: boolean;
}

const stateDict: Record<string, string> = {
  get active() {
    return ta("فعال");
  },
  get scheduled() {
    return ta("تمدید (شروع بعد از دوره‌ی فعلی)");
  },
  get expired() {
    return ta("منقضی");
  },
  get cancelled() {
    return ta("لغوشده");
  },
};

const Subscribers = () => {
  const state = useFinanceFilters({});
  const { data: list, error, isValidating } = useFinanceList<ISubscriberRow>(
    SUBSCRIBERS_PATH,
    state.query,
    state.page,
  );
  const counts = (list?.body.counts || {}) as Partial<Record<string, number>>;
  const stats = (list?.body.stats || {}) as { members?: number; revenue30d?: number };
  const num = new Intl.NumberFormat(adminIntlTag());
  const dateFormat = new Intl.DateTimeFormat(adminIntlTag(), { dateStyle: "medium" });
  const fmt = (v?: string) => (v && !isNaN(new Date(v).getTime()) ? dateFormat.format(new Date(v)) : "—");
  const tabs: { key: string; title: string; count?: number }[] = [
    { key: "", title: ta("همه") },
    { key: "active", title: ta("فعال"), count: counts.active },
    { key: "expiring", title: ta("رو به پایان (۷ روز)"), count: counts.expiring },
    { key: "scheduled", title: ta("تمدیدشده"), count: counts.scheduled },
    { key: "expired", title: ta("منقضی"), count: counts.expired },
    { key: "cancelled", title: ta("لغوشده"), count: counts.cancelled },
    { key: "granted", title: ta("اعطایی"), count: counts.granted },
  ];
  return (
    <HandleLoading data={!!list} error={error}>
      {!!list && (
        <>
          <p className={classes.note}>
            {ta("${1} عضو فعال · فروش ۳۰ روز اخیر: ${2} تومان", [
              num.format(stats.members || 0),
              currencize(stats.revenue30d || 0),
            ])}
          </p>
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
                {typeof tab.count === "number" && <span className={classes.tabCount}>{num.format(tab.count)}</span>}
              </button>
            ))}
          </div>
          <FinanceFilterBar
            state={state}
            dates={false}
            searchPlaceholder={ta("موبایل، نام یا کد ملی کاربر...")}
            exportPath={SUBSCRIBERS_PATH}
            exportName="pro-subscribers"
          />
          <Table
            toolbar={false}
            name="AdminProSubscribers"
            data={list.rows}
            exportable={false}
            renderer={{
              user: {
                name: ta("کاربر"),
                value: (node) => userLabel(node.user),
                filter: "Text",
                component: (node) =>
                  node.user?._id ? (
                    <InlineLink href={adminPath(`/user/${node.user._id}`)}>{userLabel(node.user)}</InlineLink>
                  ) : (
                    "—"
                  ),
              },
              days: {
                name: ta("مدت"),
                value: (node) => ta("${1} روز", [num.format(node.days || 0)]),
              },
              startedAt: {
                name: ta("شروع"),
                value: (node) => (node.startedAt ? new Date(node.startedAt) : undefined),
                filter: "Date",
                component: (node) => fmt(node.startedAt),
              },
              expiresAt: {
                name: ta("پایان"),
                value: (node) => (node.expiresAt ? new Date(node.expiresAt) : undefined),
                filter: "Date",
                component: (node) =>
                  `${fmt(node.expiresAt)}${
                    node.daysLeft !== null ? ` (${ta("${1} روز", [num.format(node.daysLeft)])})` : ""
                  }`,
              },
              state: {
                name: ta("وضعیت"),
                value: (node) => stateDict[node.state] || node.state,
                filter: "Set",
                component: (node) => (
                  <span
                    className={`${classes.badge} ${
                      classes[`badge_${node.state === "cancelled" ? "expired" : node.state === "scheduled" ? "expiring" : node.state}`] || ""
                    }`}
                  >
                    {stateDict[node.state] || node.state}
                  </span>
                ),
              },
              paid: {
                name: ta("پرداخت"),
                value: (node) =>
                  node.granted ? ta("اعطایی پشتیبانی") : `${currencize(node.paid || 0)} ${ta("تومان")}`,
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
        </>
      )}
    </HandleLoading>
  );
};

const AdminPatientProTab = () => {
  const [view, setView] = useState<"plan" | "subscribers">("plan");
  return (
    <WithTitle title={ta("اشتراک پرو کاربران")}>
      <div className={classes.tabs} role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={view === "plan"}
          className={`${classes.tab} ${view === "plan" ? classes.tabActive : ""}`}
          onClick={() => setView("plan")}
        >
          {ta("تنظیمات، قیمت و مزایا")}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={view === "subscribers"}
          className={`${classes.tab} ${view === "subscribers" ? classes.tabActive : ""}`}
          onClick={() => setView("subscribers")}
        >
          {ta("مشترکان")}
        </button>
      </div>
      {view === "plan" ? <ProPlanForm /> : <Subscribers />}
    </WithTitle>
  );
};

export default AdminPatientProTab;
