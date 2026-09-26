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
] as const;

export type PharmacyDashboardModule = (typeof pharmacyDashboardModules)[number];

export const pharmacyDashboardModuleLabels: Record<
  PharmacyDashboardModule,
  string
> = {
  profile: "پروفایل",
  secrataries: "منشی ها",
  products: "محصولات",
  productPackages: "پکیج های محصولات",
  incomingOrders: "سفارش های ورودی",
  licenses: "مجوزها",
  prescriptions: "نسخه ها",
  tamin: "تامین",
  articles: "مقالات",
};

export type BasePharmacyLicensePopulation = Population<Record<never, never>>;

export interface IBasePharmacyLicense<
  T extends BasePharmacyLicensePopulation = BasePharmacyLicensePopulation,
> extends MongoDoc {
  displayName?: string;
  order: number;
  isDefault: boolean;
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
    displayName: { title: "نام نمایشی", type: "text" },
    order: { title: "رتبه", type: "number" },
    isDefault: { title: "پیش فرض", type: "bool" },
    isRecommended: { title: "پیشنهادی", type: "bool" },
    isDiscounted: { title: "تخفیف دار", type: "bool" },
    isActive: { title: "فعال", type: "bool" },
    isPrimary: { title: "پلن اصلی", type: "bool" },
    isGolden: { title: "طلایی", type: "bool" },
    pricing: { title: "قیمت‌گذاری", type: "licensePricing" },
    descriptions: { title: "توضیحات", type: "strings" },
    summary: { title: "خلاصه", type: "text" },
    details: { title: "جزئیات", type: "rtf" },
    modules: {
      title: "منوهای قابل دسترسی",
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
      title="پلن های مجوز داروخانه"
      table={({ mutate }) => ({
        displayName: {
          name: "نام پلن",
          value: (node) => node.displayName,
          filter: "Text",
        },
        isActive: {
          name: "فعال",
          value: (node) => booleanToValue[`${!!node.isActive}`],
          component: (node) => <BooleanToIcon value={node.isActive} />,
          filter: "Set",
        },
        isPrimary: {
          name: "پلن اصلی",
          value: (node) => booleanToValue[`${!!node.isPrimary}`],
          component: (node) => <BooleanToIcon value={node.isPrimary} />,
          filter: "Set",
        },
        isDefault: {
          name: "پیش‌فرض",
          value: (node) => booleanToValue[`${!!node.isDefault}`],
          component: (node) => <BooleanToIcon value={node.isDefault} />,
          filter: "Set",
        },
        isRecommended: {
          name: "پیشنهادی",
          value: (node) => booleanToValue[`${!!node.isRecommended}`],
          component: (node) => <BooleanToIcon value={node.isRecommended} />,
          filter: "Set",
        },
        order: {
          name: "رتبه",
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
          name: "عملیات",
          component: (node) => (
            <TableActions>
              <IconLink
                href={adminPath(`/basePharmacyLicense/${node._id}`)}
                title="ویرایش"
              >
                <EditIcon />
              </IconLink>
              <IconButton
                variant="Danger"
                title="حذف"
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
