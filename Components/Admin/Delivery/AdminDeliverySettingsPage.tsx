"use client";

import useSWR from "swr";
import WithTitle from "../UI/WithTitle";
import Box from "../UI/Box";
import HandleLoading from "../UI/HandleLoading";
import CreateForm from "../UI/CreateForm";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import {
  addressCityField,
  addressCityLabel,
  IAddressCity,
} from "@/Components/Dashboard/Address/DashboardManageAddressesPage";
import classes from "./AdminDeliverySettingsPage.module.css";
import { ta } from "@/Components/Admin/i18n/adminText";

// Super admin: shipping of cart orders (backend Lib/delivery.ts). Same city
// as the pharmacy -> Tapsi at this flat fee (until its API is connected);
// another city -> Tipax pay-on-delivery, nothing charged on the site.
// Persian-only, like the other admin settings pages.

type DeliverySettings = {
  tapsiFlatFee: number;
  defaultOriginCity: IAddressCity | null;
  fallbackOriginCity: IAddressCity | null;
  // Tipax delivery confirmation (2026-10, backend Services/shipmentDeliveryService.ts)
  tipaxAutoConfirmDays: number;
  tipaxTrackingUrl: string;
  updatedAt: string | null;
};

const AdminDeliverySettingsPage = () => {
  const { data, error, mutate } = useSWR<DeliverySettings>(
    `${API}/admin/delivery/settings`,
    (url: string) => fetcher({ url }).then((res) => res.data),
  );
  const origin = data?.defaultOriginCity || data?.fallbackOriginCity;
  const cityField = addressCityField(ta("مبدأ پیش‌فرض (داروخانه‌ی بدون شهر)"));

  return (
    <WithTitle title={ta("تنظیمات ارسال")}>
      <HandleLoading data={!!data} error={error}>
        {!!data && (
          <>
            <Box className={classes.box}>
              <span className={classes.sectionTitle}>{ta("منطق ارسال")}</span>
              <p className={classes.rule}>
                {ta("مبدأ و مقصد در یک شهر: پیک تپسی با هزینه‌ی ثابت که هنگام خرید از خریدار گرفته می‌شود و با تحویل اولین قلم به کیف پول داروخانه می‌رود.")}
              </p>
              <p className={classes.rule}>
                {ta("مبدأ و مقصد در دو شهر: تیپاکس به‌صورت پس‌کرایه. در سایت چیزی گرفته نمی‌شود و خریدار هزینه را هنگام تحویل به مأمور تیپاکس می‌پردازد.")}
              </p>
              <p className={classes.rule}>
                {ta("مرسوله‌ی تیپاکس فقط وقتی تحویل‌شده حساب می‌شود که خریدار «تحویل گرفتم» را بزند، پشتیبانی آن را ثبت کند، یا ${1} روز پس از ارسال بگذرد و خریدار گزارش «مرسوله نرسیده» نداده باشد. سهم داروخانه و درخواست امتیاز از خریدار از همان لحظه شروع می‌شود.", [String(data.tipaxAutoConfirmDays)])}
              </p>
              <p className={classes.rule}>
                {ta("مبدأ هر سفارش شهر داروخانه است. داروخانه‌ای که شهرش ثبت نشده از «${1}» ارسال می‌کند. هر داروخانه در سبد خرید یک مرسوله‌ی جدا حساب می‌شود.", [addressCityLabel(origin || undefined) || "تهران"])}
              </p>
            </Box>
            <CreateForm<{
              tapsiFlatFee: number;
              defaultOriginCity?: IAddressCity | string;
              tipaxAutoConfirmDays: number;
              tipaxTrackingUrl: string;
            }>
              defaultValue={{
                tapsiFlatFee: data.tapsiFlatFee,
                defaultOriginCity: data.defaultOriginCity || undefined,
                tipaxAutoConfirmDays: data.tipaxAutoConfirmDays,
                tipaxTrackingUrl: data.tipaxTrackingUrl,
              }}
              renderer={{
                tapsiFlatFee: {
                  type: "number",
                  price: true,
                  title: ta("هزینه‌ی ثابت تپسی (تومان)"),
                },
                defaultOriginCity: {
                  ...cityField,
                  getDefaultValue: (node) =>
                    typeof node.defaultOriginCity === "string"
                      ? node.defaultOriginCity
                      : node.defaultOriginCity?._id,
                },
                tipaxAutoConfirmDays: {
                  type: "number",
                  title: ta("تأیید خودکار تحویل تیپاکس (روز پس از ارسال)"),
                  hint: ta("از ۱ تا ۳۰ روز. برای مرسوله‌هایی که از این پس ارسال می‌شوند."),
                },
                tipaxTrackingUrl: {
                  type: "text",
                  title: ta("نشانی رهگیری تیپاکس"),
                  hint: ta("{code} جای شماره‌ی بارنامه می‌نشیند. خالی بگذارید تا نشانی پیش‌فرض به کار رود."),
                },
              }}
              hookProps={{
                method: "POST",
                path: `${API}/admin/delivery/settings`,
                successCb: () => mutate(),
              }}
            />
          </>
        )}
      </HandleLoading>
    </WithTitle>
  );
};

export default AdminDeliverySettingsPage;
