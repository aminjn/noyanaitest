"use client";

import { MongoDoc } from "@/Components/Hooks/useUser";
import NodesManager from "../UI/NodesManager";
import { Population } from "../Clinic/AdminManageClinicsPage";
import TableActions from "../UI/TableActions";
import IconButton from "../UI/IconButton";
import usePopup from "@/Components/Hooks/usePopup";
import DeleteShitPopup from "../UI/DeleteShitPopup";
import GarbageIcon from "@/Components/Icons/GarbageIcon";
import IconLink from "../UI/IconLink";
import { adminPath } from "@/Components/helpers/adminPath";
import EditIcon from "@/Components/Icons/EditIcon";
import { FormRenderer } from "../UI/CreateForm";
import OrderEditor from "../UI/OrderEditor";
import BooleanToIcon, { booleanToValue } from "@/Components/UI/BooleanToIcon";
import { ILicensePricingEntry } from "../UI/LicensePricingInput";
import { ta } from "@/Components/Admin/i18n/adminText";

// Menu items available in the pharmacy dashboard (PharmacyPanelSidebar).
// Kept in sync with Models/BasePharmacyLicense.ts on noyanai-back and with
// the `title` values in Components/Layout/PharmacyPanelSidebar.tsx
// (excluding "logout", which is an action, not a menu). Mirrors
// Components/Admin/BaseDoctorLicense/AdminManageBaseDoctorLicensesPage.tsx.
export const pharmacyDashboardModules = [
  "profile",
  "secrataries",
  "products",
  "productPackages",
  "incomingOrders",
  "licenses",
  "prescriptions",
  "tamin",
  "articles",
  // Noyan Business (2026-10): the books
  "accounting",
  // Noyan Business phase 2 (2026-10): stock, batches, suppliers, purchases
  "inventory",
  // Noyan Business phase 3 (2026-10): employees, payslips, insurance and tax
  "payroll",
  // Noyan Business phase 4 (2026-10): patients and customers, follow-ups, SMS campaigns
  "crm",
  // Noyan Business phase 5 (2026-10): electronic invoices (Moadian)
  "moadian",
] as const;

export type PharmacyDashboardModule = (typeof pharmacyDashboardModules)[number];

export const pharmacyDashboardModuleLabels: Record<
  PharmacyDashboardModule,
  string
> = {
  get profile() {
  return ta("پروفایل");
},
  get secrataries() {
  return ta("منشی ها");
},
  get products() {
  return ta("محصولات");
},
  get productPackages() {
  return ta("پکیج های محصولات");
},
  get incomingOrders() {
  return ta("سفارش های ورودی");
},
  get licenses() {
  return ta("مجوزها");
},
  get prescriptions() {
  return ta("نسخه ها");
},
  get tamin() {
  return ta("تامین");
},
  get articles() {
  return ta("مقالات");
},
  get accounting() {
  return ta("حسابداری");
},
  get payroll() {
  return ta("حقوق و دستمزد");
},
  get crm() {
  return ta("ارتباط با بیماران و کمپین پیامکی");
},
  get moadian() {
  return ta("صورتحساب الکترونیکی (سامانه‌ی مودیان)");
},
  get inventory() {
  return ta("انبار و خرید");
},
};

export type BasePharmacyLicensePopulation = Population<Record<never, never>>;

export interface IBasePharmacyLicense<
  T extends BasePharmacyLicensePopulation = BasePharmacyLicensePopulation,
> extends MongoDoc {
  displayName?: string;
  order: number;
  isDefault: boolean;
  // campaign SMS parts included each month (2026-10); beyond it the wallet pays
  monthlySmsQuota: number;
  // Replaces the old flat monthlyPrice/monthlyDiscount/annualPrice/
  // annualDiscount fields (2026-09) - one pricing option per
  // Models/LicenseDuration.ts catalog entry, edited via the
  // "licensePricing" CreateForm field type below.
  pricing: ILicensePricingEntry[];
  descriptions: string[];
  modules: PharmacyDashboardModule[];
  isRecommended: boolean;
  isDiscounted: boolean;
  isActive: boolean;
  // Whether this plan is part of the "primary" lineup shown on the main
  // license page (backend filters GET /pharmacy/license on isActive AND
  // isPrimary) - an isActive plan that isn't isPrimary is still purchasable
  // via its direct id or the "see all plans" listing, just not featured.
  isPrimary: boolean;
  isGolden: boolean;
  summary: string;
  details: string;
}

export const basePharmacyLicenseFormRenderer: FormRenderer<IBasePharmacyLicense> =
  {
    displayName: { get title() {
  return ta("نام نمایشی");
}, type: "text" },
    order: { get title() {
  return ta("رتبه");
}, type: "number" },
    isDefault: { get title() {
  return ta("پیش فرض");
}, type: "bool" },
    isRecommended: { get title() {
  return ta("پیشنهادی");
}, type: "bool" },
    isDiscounted: { get title() {
  return ta("تخفیف دار");
}, type: "bool" },
    isActive: { get title() {
  return ta("فعال");
}, type: "bool" },
    isPrimary: { get title() {
  return ta("پلن اصلی");
}, type: "bool" },
    isGolden: { get title() {
  return ta("طلایی");
}, type: "bool" },
    pricing: { get title() {
  return ta("قیمت‌گذاری");
}, type: "licensePricing" },
    monthlySmsQuota: { get title() {
  return ta("سهمیه‌ی پیامک کمپین در ماه (بیشتر از آن از کیف پول)");
}, type: "number" },
    descriptions: { get title() {
  return ta("توضیحات");
}, type: "strings" },
    summary: { get title() {
  return ta("خلاصه");
}, type: "text" },
    details: { get title() {
  return ta("جزئیات");
}, type: "rtf" },
    modules: {
      get title() {
  return ta("منوهای قابل دسترسی");
},
      type: "multiselect",
      options: pharmacyDashboardModuleLabels,
    },
  };

const AdminManageBasePharmacyLicensesPage = () => {
  const { setPopup } = usePopup();

  return (
    <NodesManager<IBasePharmacyLicense>
      create={basePharmacyLicenseFormRenderer}
      modelName="basePharmacyLicense"
      title={ta("پلن های مجوز داروخانه")}
      table={({ mutate }) => ({
        displayName: {
          name: ta("نام پلن"),
          value: (node) => node.displayName,
          filter: "Text",
        },
        isActive: {
          name: ta("فعال"),
          value: (node) => booleanToValue[`${!!node.isActive}`],
          component: (node) => <BooleanToIcon value={node.isActive} />,
          filter: "Set",
        },
        isPrimary: {
          name: ta("پلن اصلی"),
          value: (node) => booleanToValue[`${!!node.isPrimary}`],
          component: (node) => <BooleanToIcon value={node.isPrimary} />,
          filter: "Set",
        },
        isDefault: {
          name: ta("پیش‌فرض"),
          value: (node) => booleanToValue[`${!!node.isDefault}`],
          component: (node) => <BooleanToIcon value={node.isDefault} />,
          filter: "Set",
        },
        isRecommended: {
          name: ta("پیشنهادی"),
          value: (node) => booleanToValue[`${!!node.isRecommended}`],
          component: (node) => <BooleanToIcon value={node.isRecommended} />,
          filter: "Set",
        },
        order: {
          name: ta("رتبه"),
          value: (node) => node.order,
          filter: "Number",
          component: (node) => (
            <OrderEditor
              modelName="basePharmacyLicense"
              mutate={mutate}
              value={node.order}
              _id={node._id}
            />
          ),
        },
        actions: {
          name: ta("عملیات"),
          component: (node) => (
            <TableActions>
              <IconLink
                href={adminPath(`/basePharmacyLicense/${node._id}`)}
                title={ta("ویرایش")}
              >
                <EditIcon />
              </IconLink>
              <IconButton
                variant="Danger"
                title={ta("حذف")}
                onClick={() =>
                  setPopup(
                    "Delete",
                    <DeleteShitPopup
                      mutate={mutate}
                      modelName="basePharmacyLicense"
                      nodeId={node._id}
                    />,
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

export default AdminManageBasePharmacyLicensesPage;
