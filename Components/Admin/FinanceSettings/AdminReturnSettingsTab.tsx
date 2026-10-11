"use client";

import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "../UI/HandleLoading";
import WithTitle from "../UI/WithTitle";
import CreateForm from "../UI/CreateForm";
import { IAppConfig } from "../AppConfig/AdminManageAppConfigPage";
import { IProductCategory } from "../ProductCategory/AdminManageProductCategoriesPage";
import { ta } from "@/Components/Admin/i18n/adminText";

// Returns of delivered goods (2026-10, backend Services/orderReturnService.ts,
// the Digikala «مرجوعی» rules). How long after delivery a buyer may ask,
// whether "changed my mind" is offered, which categories come back only for
// the seller's error (cold chain, opened hygiene items), how long the
// seller has to answer before support decides, and how long a returned
// parcel may take to come back. A seller is never in debt (2026-10 owner
// decision, Digikala's model): a pharmacy line's earning stays held until
// the window and both deadlines have passed (backend Lib/payoutHold.ts), so
// a refund always comes out of money NoyanAI still holds. Stored on
// AppConfig; a request is judged by the values of the day it is made.
const AdminReturnSettingsTab = () => {
  const { data, error, mutate } = useSWR<IAppConfig>(`${API}/auto/appConfig`, (url: string) =>
    fetcher({ url }).then((res) => res.data.data),
  );
  const rules = ta("قواعد مرجوعی خریدار");
  const seller = ta("فروشنده و پشتیبانی");
  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle title={ta("مرجوعی کالا")}>
          <CreateForm<IAppConfig>
            layout="sections"
            defaultValue={{
              ...data,
              returnWindowDays: data.returnWindowDays ?? 7,
              returnChangedMindAllowed: data.returnChangedMindAllowed ?? true,
              returnNonReturnableCategories: data.returnNonReturnableCategories ?? [],
              returnSellerResponseHours: data.returnSellerResponseHours ?? 48,
              returnReceiveDays: data.returnReceiveDays ?? 10,
            }}
            hookProps={{ path: `${API}/auto/appConfig`, method: "POST", successCb: () => mutate() }}
            renderer={{
              returnWindowDays: {
                title: ta("مهلت مرجوعی پس از تحویل (روز، ۰ تا ۶۰، ۰ یعنی خریدار مرجوع نمی‌کند)"),
                type: "number",
                section: rules,
                hint: ta("از لحظه‌ی تحویل هر قلم (تحویل پیک یا تأیید تحویل تیپاکس) شمرده می‌شود. فروشنده هیچ‌وقت بدهکار نمی‌شود: درآمد هر قلم داروخانه و هزینه‌ی ارسال بسته تا پایان این مهلت به‌علاوه‌ی مهلت پاسخ فروشنده و مهلت دریافت کالا (اگر دیرتر از دوره‌ی تسویه باشد) و تا بسته شدن مرجوعی باز آن نگه داشته می‌شود. بازپرداخت پشتیبانی یا آزمایشگاه به این مهلت محدود نیست؛ اگر پس از تسویه باشد از درآمدهای در انتظار فروشنده و در غیر این صورت از حساب نویان پرداخت و به مدیر کل خبر داده می‌شود."),
              },
              returnChangedMindAllowed: {
                title: ta("انصراف از خرید برای کالای باز نشده"),
                type: "bool",
                section: rules,
                hint: ta("فقط برای کالای بدون نسخه و خارج از دسته‌های غیرقابل مرجوع؛ هزینه‌ی برگشت با خریدار است و از مبلغ برگشتی کم می‌شود."),
              },
              returnNonReturnableCategories: {
                title: ta("دسته‌های غیرقابل مرجوع (جز در خطای فروشنده)"),
                type: "nodes",
                multi: true,
                section: rules,
                path: `${API}/auto/productCategory`,
                creatable: { path: `${API}/auto/productCategory` },
                getOptionLabel: (node) => (node as IProductCategory).name || ta("بدون نام"),
                getOptionValue: (node) => (node as IProductCategory)._id,
                getDefaultValue: (inp) => inp.returnNonReturnableCategories,
                hint: ta("مثل داروهای یخچالی، واکسن و انسولین یا کالای بهداشتی باز شده. داروی نسخه‌ای همیشه فقط در خطای فروشنده پس گرفته می‌شود."),
              },
              returnSellerResponseHours: {
                title: ta("مهلت پاسخ فروشنده به درخواست مرجوعی (ساعت)"),
                type: "number",
                section: seller,
                hint: ta("درخواستی که فروشنده در این مدت تأیید یا رد نکند، خودکار به صف درخواست‌ها (مرجوعی‌های در داوری) می‌رود."),
              },
              returnReceiveDays: {
                title: ta("مهلت رسیدن و تأیید دریافت کالای مرجوعی (روز)"),
                type: "number",
                section: seller,
                hint: ta("کالای ارسال‌شده‌ای که فروشنده در این مدت دریافتش را تأیید نکند به داوری پشتیبانی می‌رود؛ مرجوعیِ تأییدشده‌ای که خریدار نفرستد بسته می‌شود."),
              },
            }}
          />
        </WithTitle>
      )}
    </HandleLoading>
  );
};

export default AdminReturnSettingsTab;
