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

// Super admin: shipping of cart orders (backend Lib/delivery.ts). Same city
// as the pharmacy -> Tapsi at this flat fee (until its API is connected);
// another city -> Tipax pay-on-delivery, nothing charged on the site.
// Persian-only, like the other admin settings pages.

type DeliverySettings = {
  tapsiFlatFee: number;
  defaultOriginCity: IAddressCity | null;
  fallbackOriginCity: IAddressCity | null;
  updatedAt: string | null;
};

const AdminDeliverySettingsPage = () => {
  const { data, error, mutate } = useSWR<DeliverySettings>(
    `${API}/admin/delivery/settings`,
    (url: string) => fetcher({ url }).then((res) => res.data),
  );
  const origin = data?.defaultOriginCity || data?.fallbackOriginCity;
  const cityField = addressCityField("مبدأ پیش‌فرض (داروخانه‌ی بدون شهر)");

  return (
    <WithTitle title="تنظیمات ارسال">
      <HandleLoading data={!!data} error={error}>
        {!!data && (
          <>
            <Box className={classes.box}>
              <span className={classes.sectionTitle}>منطق ارسال</span>
              <p className={classes.rule}>
                مبدأ و مقصد در یک شهر: پیک تپسی با هزینه‌ی ثابت که هنگام خرید از
                خریدار گرفته می‌شود و با تحویل اولین قلم به کیف پول داروخانه
                می‌رود.
              </p>
              <p className={classes.rule}>
                مبدأ و مقصد در دو شهر: تیپاکس به‌صورت پس‌کرایه. در سایت چیزی
                گرفته نمی‌شود و خریدار هزینه را هنگام تحویل به مأمور تیپاکس
                می‌پردازد.
              </p>
              <p className={classes.rule}>
                {`مبدأ هر سفارش شهر داروخانه است. داروخانه‌ای که شهرش ثبت نشده از «${addressCityLabel(origin || undefined) || "تهران"}» ارسال می‌کند. هر داروخانه در سبد خرید یک مرسوله‌ی جدا حساب می‌شود.`}
              </p>
            </Box>
            <CreateForm<{
              tapsiFlatFee: number;
              defaultOriginCity?: IAddressCity | string;
            }>
              defaultValue={{
                tapsiFlatFee: data.tapsiFlatFee,
                defaultOriginCity: data.defaultOriginCity || undefined,
              }}
              renderer={{
                tapsiFlatFee: {
                  type: "number",
                  price: true,
                  title: "هزینه‌ی ثابت تپسی (تومان)",
                },
                defaultOriginCity: {
                  ...cityField,
                  getDefaultValue: (node) =>
                    typeof node.defaultOriginCity === "string"
                      ? node.defaultOriginCity
                      : node.defaultOriginCity?._id,
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
