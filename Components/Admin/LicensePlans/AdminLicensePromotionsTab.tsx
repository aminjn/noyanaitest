"use client";
import { TEHRAN_TZ } from "@/Components/helpers/tehranTime";

import { useMemo } from "react";
import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import { currencize } from "@/Components/helpers/currencize";
import { MongoDoc } from "@/Components/Hooks/useUser";
import usePopup from "@/Components/Hooks/usePopup";
import PopupCard from "@/Components/UI/PopupCard";
import BooleanToIcon, { booleanToValue } from "@/Components/UI/BooleanToIcon";
import EditIcon from "@/Components/Icons/EditIcon";
import GarbageIcon from "@/Components/Icons/GarbageIcon";
import NodesManager from "../UI/NodesManager";
import CreateForm, { FormRenderer } from "../UI/CreateForm";
import TableActions from "../UI/TableActions";
import IconButton from "../UI/IconButton";
import DeleteShitPopup from "../UI/DeleteShitPopup";
import { adminIntlTag, ta } from "@/Components/Admin/i18n/adminText";

// «تخفیف و پیشنهاد ویژه» (2026-10, owner decision: a launch discount for
// high adoption) - the plan promotions of noyanai-back Models/
// LicensePromotion.ts: percent or toman off, a start and end day, for whole
// provider kinds and/or chosen plans, optionally only on a provider's
// first purchase and optionally only with a code. Every purchase and every
// pricing page uses the best running one (Lib/licenseQuote.ts); the panels
// and /pricing show the struck-through price, the badge and a countdown.
// (2026-10) The same engine prices the cart: a promotion "on" pharmacy or
// lab orders is a discount code (or an automatic discount) at the cart
// checkout (noyanai-back Lib/cartOffers.ts), optionally only for chosen
// sellers or categories, with a minimum, uses per buyer, and who pays it.

const KINDS = ["doctor", "clinic", "hospital", "pharmacy", "paraClinic", "insurance"] as const;
// the patients' «پرو» membership (2026-10) is priced by the same engine,
// and so are cart orders (2026-10)
type Kind = (typeof KINDS)[number] | "patient" | "pharmacyOrder" | "labOrder";
const ORDER_KINDS: Kind[] = ["pharmacyOrder", "labOrder"];

const kindLabels: Record<Kind, string> = {
  get doctor() {
    return ta("پزشک");
  },
  get clinic() {
    return ta("کلینیک");
  },
  get hospital() {
    return ta("بیمارستان");
  },
  get pharmacy() {
    return ta("داروخانه");
  },
  get paraClinic() {
    return ta("پاراکلینیک");
  },
  get insurance() {
    return ta("بیمه");
  },
  get patient() {
    return ta("کاربران (اشتراک پرو)");
  },
  get pharmacyOrder() {
    return ta("سفارش‌های داروخانه (سبد خرید)");
  },
  get labOrder() {
    return ta("سفارش‌های آزمایشگاه (سبد خرید)");
  },
};

const planModels: Record<(typeof KINDS)[number], string> = {
  doctor: "baseDoctorLicense",
  clinic: "baseClinicLicense",
  hospital: "baseHospitalLicense",
  pharmacy: "basePharmacyLicense",
  paraClinic: "baseParaClinicLicense",
  insurance: "baseInsuranceLicense",
};

export interface ILicensePromotion extends MongoDoc {
  title: string;
  isActive: boolean;
  discountType: "percent" | "amount";
  value: number;
  maxDiscount: number;
  startsAt: string;
  endsAt: string;
  kinds: Kind[];
  plans: string[];
  firstPurchaseOnly: boolean;
  code: string;
  maxRedemptions: number;
  redemptions: number;
  // cart orders only (2026-10)
  pharmacies?: string[];
  paraClinics?: string[];
  productCategories?: string[];
  testCategories?: string[];
  minOrder?: number;
  maxPerUser?: number;
  fundedBy?: "platform" | "seller";
}

type Named = { _id?: string; name?: string };
const named = {
  getOptionLabel: (node: unknown) => (node as Named)?.name || ta("بدون نام"),
  getOptionValue: (node: unknown) => String((node as Named)?._id || ""),
  multi: true,
  clearable: true,
};
const idsOf = (v: unknown) =>
  (Array.isArray(v) ? v : []).map((x) => String((x as Named)?._id ?? x)).filter(Boolean);

// every plan of every kind, as "پزشک · حرفه‌ای" options
const usePlanOptions = () => {
  const { data } = useSWR<Record<string, string>>(
    `${API}/auto/licensePlans:all`,
    async () => {
      const lists = await Promise.all(
        KINDS.map((kind) =>
          fetcher({ url: `${API}/auto/${planModels[kind]}` })
            .then((res) => {
              const raw = res?.data?.data ?? res?.data;
              return Array.isArray(raw) ? raw : [];
            })
            .catch(() => []),
        ),
      );
      const options: Record<string, string> = {};
      lists.forEach((list, i) =>
        (list as { _id?: string; displayName?: string }[]).forEach((plan) => {
          if (!plan?._id) return;
          options[plan._id] = `${kindLabels[KINDS[i]]} · ${plan.displayName || ta("بدون نام")}`;
        }),
      );
      // the one «پرو» plan
      const pro = await fetcher({ url: `${API}/admin/pro/plan` })
        .then((res) => res?.data as { _id?: string; displayName?: string } | undefined)
        .catch(() => undefined);
      if (pro?._id) options[pro._id] = `${kindLabels.patient} · ${pro.displayName || ta("بدون نام")}`;
      return options;
    },
    { revalidateOnFocus: false },
  );
  return data || {};
};

const promotionRenderer = (planOptions: Record<string, string>): FormRenderer<ILicensePromotion> => ({
  title: {
    get title() {
      return ta("عنوان (روی برچسب قیمت)");
    },
    type: "text",
    required: true,
    get hint() {
      return ta("مثلاً «تخفیف ویژه‌ی افتتاحیه»");
    },
  },
  discountType: {
    get title() {
      return ta("نوع تخفیف");
    },
    type: "select",
    options: {
      get percent() {
        return ta("درصد");
      },
      get amount() {
        return ta("مبلغ (تومان)");
      },
    },
  },
  value: {
    get title() {
      return ta("مقدار تخفیف (درصد یا تومان)");
    },
    type: "number",
    required: true,
  },
  maxDiscount: {
    get title() {
      return ta("سقف تخفیف درصدی (تومان، ۰ = بدون سقف)");
    },
    type: "number",
    price: true,
  },
  startsAt: {
    get title() {
      return ta("از تاریخ");
    },
    type: "date",
  },
  endsAt: {
    get title() {
      return ta("تا تاریخ (تا پایان همان روز)");
    },
    type: "date",
    required: true,
  },
  isActive: {
    get title() {
      return ta("فعال");
    },
    type: "bool",
  },
  firstPurchaseOnly: {
    get title() {
      return ta("فقط برای اولین خرید");
    },
    type: "bool",
  },
  kinds: {
    get title() {
      return ta("روی پلن‌های این ارائه‌دهنده‌ها یا سفارش‌های سبد خرید");
    },
    type: "multiselect",
    options: kindLabels,
  },
  plans: {
    get title() {
      return ta("یا فقط این پلن‌ها");
    },
    type: "multiselect",
    options: planOptions,
  },
  code: {
    get title() {
      return ta("کد تخفیف (خالی = خودکار برای همه)");
    },
    type: "text",
    ltr: true,
    get hint() {
      return ta("با کد، تخفیف فقط وقتی اعمال می‌شود که خریدار کد را در صفحه‌ی پرداخت وارد کند");
    },
  },
  maxRedemptions: {
    get title() {
      return ta("حداکثر دفعات استفاده (۰ = نامحدود)");
    },
    type: "number",
  },
  // ---- cart orders only (2026-10, noyanai-back Lib/cartOffers.ts) ----
  pharmacies: {
    get title() {
      return ta("فقط این داروخانه‌ها (خالی = همه)");
    },
    get section() {
      return ta("سفارش‌های داروخانه و آزمایشگاه");
    },
    type: "nodes",
    path: `${API}/auto/pharmacy`,
    ...named,
    getDefaultValue: (n: ILicensePromotion) => idsOf(n.pharmacies),
  },
  paraClinics: {
    get title() {
      return ta("فقط این آزمایشگاه‌ها (خالی = همه)");
    },
    get section() {
      return ta("سفارش‌های داروخانه و آزمایشگاه");
    },
    type: "nodes",
    path: `${API}/auto/paraClinic`,
    ...named,
    getDefaultValue: (n: ILicensePromotion) => idsOf(n.paraClinics),
  },
  productCategories: {
    get title() {
      return ta("فقط کالاهای این دسته‌ها (خالی = همه)");
    },
    get section() {
      return ta("سفارش‌های داروخانه و آزمایشگاه");
    },
    type: "nodes",
    path: `${API}/auto/productCategory`,
    ...named,
    getDefaultValue: (n: ILicensePromotion) => idsOf(n.productCategories),
  },
  testCategories: {
    get title() {
      return ta("فقط آزمایش‌های این دسته‌ها (خالی = همه)");
    },
    get section() {
      return ta("سفارش‌های داروخانه و آزمایشگاه");
    },
    type: "nodes",
    path: `${API}/auto/testCategory`,
    ...named,
    getDefaultValue: (n: ILicensePromotion) => idsOf(n.testCategories),
  },
  minOrder: {
    get title() {
      return ta("حداقل مبلغ اقلام مشمول (تومان، ۰ = بدون حداقل)");
    },
    get section() {
      return ta("سفارش‌های داروخانه و آزمایشگاه");
    },
    type: "number",
    price: true,
  },
  maxPerUser: {
    get title() {
      return ta("دفعات استفاده‌ی هر خریدار (۰ = نامحدود)");
    },
    get section() {
      return ta("سفارش‌های داروخانه و آزمایشگاه");
    },
    type: "number",
  },
  fundedBy: {
    get title() {
      return ta("هزینه‌ی تخفیف با");
    },
    get section() {
      return ta("سفارش‌های داروخانه و آزمایشگاه");
    },
    type: "select",
    options: {
      get platform() {
        return ta("نویان (هزینه‌ی بازاریابی؛ فروشنده مبلغ کامل را می‌گیرد)");
      },
      get seller() {
        return ta("فروشنده (فقط برای داروخانه‌ها یا آزمایشگاه‌های انتخاب‌شده)");
      },
    },
    get hint() {
      return ta("این بخش فقط برای سفارش‌های سبد خرید است و روی پلن‌ها اثری ندارد");
    },
  },
});

type Status = "running" | "scheduled" | "ended" | "off";
const statusOf = (p: ILicensePromotion): Status => {
  const now = Date.now();
  const start = p?.startsAt ? new Date(p.startsAt).getTime() : 0;
  const end = p?.endsAt ? new Date(p.endsAt).getTime() : 0;
  if (!p?.isActive) return "off";
  if (end && end <= now) return "ended";
  if (p.maxRedemptions && (p.redemptions || 0) >= p.maxRedemptions) return "ended";
  if (start > now) return "scheduled";
  return "running";
};
const statusLabels: Record<Status, string> = {
  get running() {
    return ta("در حال اجرا");
  },
  get scheduled() {
    return ta("زمان‌بندی‌شده");
  },
  get ended() {
    return ta("پایان‌یافته");
  },
  get off() {
    return ta("غیرفعال");
  },
};

const EditPromotionPopup = ({
  node,
  renderer,
  mutate,
}: {
  node: ILicensePromotion;
  renderer: FormRenderer<ILicensePromotion>;
  mutate: () => unknown;
}) => {
  const { closePopup } = usePopup();
  return (
    <PopupCard title={node.title || ta("ویرایش تخفیف")} size="wide">
      <CreateForm<ILicensePromotion>
        defaultValue={node}
        renderer={renderer}
        onCancel={() => closePopup()}
        hookProps={{
          method: "POST",
          path: `${API}/auto/licensePromotion/${node._id}`,
          successCb: () => {
            mutate();
            closePopup();
          },
        }}
      />
    </PopupCard>
  );
};

const AdminLicensePromotionsTab = () => {
  const { setPopup } = usePopup();
  const planOptions = usePlanOptions();
  const renderer = useMemo(() => promotionRenderer(planOptions), [planOptions]);
  const num = new Intl.NumberFormat(adminIntlTag());
  const date = new Intl.DateTimeFormat(adminIntlTag(), { timeZone: TEHRAN_TZ, dateStyle: "medium" });
  const fmtDate = (v?: string) => {
    const d = v ? new Date(v) : null;
    return d && !Number.isNaN(d.getTime()) ? date.format(d) : "—";
  };

  return (
    <NodesManager<ILicensePromotion>
      create={renderer}
      modelName="licensePromotion"
      title={ta("تخفیف و پیشنهاد ویژه")}
      table={({ mutate }) => ({
        title: {
          name: ta("عنوان"),
          value: (node) => node.title,
          filter: "Text",
        },
        value: {
          name: ta("تخفیف"),
          value: (node) =>
            node.discountType === "amount"
              ? `${currencize(node.value)} ${ta("تومان")}`
              : `${num.format(Number(node.value) || 0)}٪`,
        },
        window: {
          name: ta("بازه"),
          value: (node) => `${fmtDate(node.startsAt)} – ${fmtDate(node.endsAt)}`,
        },
        target: {
          name: ta("روی"),
          value: (node) =>
            [
              ...(Array.isArray(node.kinds) ? node.kinds : []).map((k) => kindLabels[k] || k),
              ...(Array.isArray(node.plans) ? node.plans : []).map((id) => planOptions[id] || id),
              // a cart-order discount: its minimum and who pays it
              ...((Array.isArray(node.kinds) ? node.kinds : []).some((k) => ORDER_KINDS.includes(k))
                ? [
                    ...(Number(node.minOrder) > 0 ? [ta("از ${1} تومان", [currencize(Number(node.minOrder))])] : []),
                    node.fundedBy === "seller" ? ta("با هزینه‌ی فروشنده") : ta("با هزینه‌ی نویان"),
                  ]
                : []),
            ].join("، ") || "—",
        },
        code: {
          name: ta("کد"),
          value: (node) => node.code || ta("خودکار"),
          filter: "Text",
        },
        firstPurchaseOnly: {
          name: ta("اولین خرید"),
          value: (node) => booleanToValue[`${!!node.firstPurchaseOnly}`],
          component: (node) => <BooleanToIcon value={!!node.firstPurchaseOnly} />,
          filter: "Set",
        },
        redemptions: {
          name: ta("استفاده"),
          value: (node) =>
            node.maxRedemptions
              ? `${num.format(node.redemptions || 0)} / ${num.format(node.maxRedemptions)}`
              : num.format(node.redemptions || 0),
        },
        status: {
          name: ta("وضعیت"),
          value: (node) => statusLabels[statusOf(node)],
          filter: "Set",
        },
        actions: {
          name: ta("عملیات"),
          component: (node) => (
            <TableActions>
              <IconButton
                title={ta("ویرایش")}
                onClick={() =>
                  setPopup(
                    "EditLicensePromotion",
                    <EditPromotionPopup node={node} renderer={renderer} mutate={mutate} />,
                  )
                }
              >
                <EditIcon />
              </IconButton>
              <IconButton
                variant="Danger"
                title={ta("حذف")}
                onClick={() =>
                  setPopup(
                    "Delete",
                    <DeleteShitPopup mutate={mutate} modelName="licensePromotion" nodeId={node._id} />,
                  )
                }
              >
                <GarbageIcon />
              </IconButton>
            </TableActions>
          ),
        },
      })}
    />
  );
};

export default AdminLicensePromotionsTab;
