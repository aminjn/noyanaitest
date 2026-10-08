"use client";

import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "../UI/HandleLoading";
import WithTitle from "../UI/WithTitle";
import CreateForm from "../UI/CreateForm";
import { IAppConfig } from "../AppConfig/AdminManageAppConfigPage";
import { ta } from "@/Components/Admin/i18n/adminText";

// Seller response deadlines of cart orders (2026-10 owner decision, backend
// Lib/orderResponse.ts). Like Digikala's and Halodoc's seller SLA: a
// pharmacy / lab line nobody answered within these hours of payment is
// cancelled automatically and refunded to the buyer's wallet; the seller is
// warned beforehand. Stored on AppConfig; a new value applies to orders
// paid from then on (each line keeps the deadline it was given).
const AdminOrderResponseSettingsTab = () => {
  const { data, error, mutate } = useSWR<IAppConfig>(
    `${API}/auto/appConfig`,
    (url: string) => fetcher({ url }).then((res) => res.data.data),
  );

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle title={ta("مهلت پاسخ فروشنده به سفارش")}>
          <CreateForm<IAppConfig>
            layout="sections"
            defaultValue={{
              ...data,
              orderResponseHoursPharmacy: data.orderResponseHoursPharmacy ?? 24,
              orderResponseHoursLab: data.orderResponseHoursLab ?? 72,
              orderResponseWarnHours: data.orderResponseWarnHours ?? 2,
              labSamplingMaxMoves: data.labSamplingMaxMoves ?? 2,
              labSamplingMaxLabProposals: data.labSamplingMaxLabProposals ?? 2,
            }}
            hookProps={{
              path: `${API}/auto/appConfig`,
              method: "POST",
              successCb: () => mutate(),
            }}
            renderer={{
              orderResponseHoursPharmacy: {
                title: ta("مهلت پاسخ داروخانه (ساعت، ۱ تا ۷۲۰)"),
                type: "number",
                section: ta("لغو خودکار سفارش بی‌پاسخ"),
                hint: ta("قلمی که داروخانه در این مدت پس از پرداخت نپذیرد، نسخه‌اش را بررسی نکند، ارسال یا آماده نکند، خودکار لغو و مبلغش به کیف پول خریدار برگردانده می‌شود."),
              },
              orderResponseHoursLab: {
                title: ta("مهلت پاسخ آزمایشگاه (ساعت، ۱ تا ۷۲۰)"),
                type: "number",
                section: ta("لغو خودکار سفارش بی‌پاسخ"),
                hint: ta("آزمایشی که آزمایشگاه در این مدت پس از پرداخت نپذیرد یا جوابش را بارگذاری نکند، خودکار لغو و مبلغش به خریدار برگردانده می‌شود."),
              },
              orderResponseWarnHours: {
                title: ta("هشدار به فروشنده پیش از پایان مهلت (ساعت، ۰ یعنی بدون هشدار)"),
                type: "number",
                section: ta("لغو خودکار سفارش بی‌پاسخ"),
                hint: ta("مهلت هر قلم هنگام پرداخت ثبت می‌شود؛ تغییر این اعداد فقط سفارش‌های بعدی را تغییر می‌دهد."),
              },
              // lab sampling reschedules (2026-10, backend Lib/labSamplingReschedule.ts)
              labSamplingMaxMoves: {
                title: ta("سقف جابه‌جایی هر نوبت نمونه‌گیری (۰ تا ۱۰، ۰ یعنی بدون جابه‌جایی)"),
                type: "number",
                section: ta("نوبت نمونه‌گیری آزمایشگاه"),
                hint: ta("خریدار و آزمایشگاه هر نوبت را حداکثر این تعداد بار، تا پیش از حداقل فاصله‌ی تعیین‌شده‌ی آزمایشگاه و پیش از نمونه‌گیری، جابه‌جا می‌کنند. پشتیبانی محدود به این سقف نیست."),
              },
              labSamplingMaxLabProposals: {
                title: ta("سقف پیشنهاد آزمایشگاه برای هر نوبت نمونه‌گیری (۰ تا ۱۰، ۰ یعنی بدون پیشنهاد)"),
                type: "number",
                section: ta("نوبت نمونه‌گیری آزمایشگاه"),
                hint: ta("آزمایشگاه برای هر نوبت حداکثر این تعداد بار پیشنهاد تغییر به نمونه‌گیری در منزل یا در آزمایشگاه می‌دهد (هر پیشنهاد برای خریدار پیامک می‌شود). جابه‌جایی‌ای که خریدار با پذیرش پیشنهاد انجام می‌دهد از سقف جابه‌جایی او کم نمی‌شود و آزمایشگاه حتی پس از پر شدن آن سقف هم می‌تواند پیشنهاد دهد."),
              },
            }}
          />
        </WithTitle>
      )}
    </HandleLoading>
  );
};

export default AdminOrderResponseSettingsTab;
