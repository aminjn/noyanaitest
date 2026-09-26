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

// Menu items available in the hospital dashboard (HospitalPanelSidebar). Kept in
// sync with Models/BaseHospitalLicense.ts on noyanai-back and with the
// `title` values in Components/Layout/HospitalPabelSidebar.tsx (excluding
// "logout", which is an action, not a menu). Mirrors
// Components/Admin/BasePharmacyLicense/AdminManageBasePharmacyLicensesPage.tsx.
export const hospitalDashboardModules = [
  "profile",
  "secrataries",
  "licenses",
  "articles",
] as const;

export type HospitalDashboardModule = (typeof hospitalDashboardModules)[number];

export const hospitalDashboardModuleLabels: Record<
  HospitalDashboardModule,
  string
> = {
  profile: "پروفایل",
  secrataries: "منشی ها",
  licenses: "مجوزها",
  articles: "مقالات",
};

export type BaseHospitalLicensePopulation = Population<Record<never, never>>;

export interface IBaseHospitalLicense<
  T extends BaseHospitalLicensePopulation = BaseHospitalLicensePopulation,
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
  modules: HospitalDashboardModule[];
  isRecommended: boolean;
  isDiscounted: boolean;
  isActive: boolean;
  // Whether this plan is part of the "primary" lineup shown on the main
  // license page (backend filters GET /hospital/license on isActive AND
  // isPrimary) - an isActive plan that isn't isPrimary is still purchasable
  // via its direct id or the "see all plans" listing, just not featured.
  isPrimary: boolean;
  isGolden: boolean;
  summary: string;
  details: string;
}

export const baseHospitalLicenseFormRenderer: FormRenderer<IBaseHospitalLicense> =
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
      options: hospitalDashboardModuleLabels,
    },
  };

// Cheapest active pricing option, shown as the plan's "starting from" price.
const minActivePrice = (node: IBaseHospitalLicense) => {
  const prices = (node.pricing || [])
    .filter((entry) => entry?.isActive && typeof entry.price === "number")
    .map((entry) => entry.price);
  return prices.length ? Math.min(...prices) : undefined;
};

const AdminManageBaseHospitalLicensesPage = () => {
  const { setPopup } = usePopup();

  return (
    <NodesManager<IBaseHospitalLicense>
      create={baseHospitalLicenseFormRenderer}
      modelName="baseHospitalLicense"
      title="پلن های مجوز بیمارستان"
      table={({ mutate }) => ({
        displayName: {
          name: "نام نمایشی",
          value: (node) => node.displayName,
          filter: "Text",
        },
        isActive: {
          name: "وضعیت",
          value: (node) => booleanToValue[`${node.isActive}`],
          component: (node) => <BooleanToIcon value={node.isActive} />,
          filter: "Set",
        },
        isPrimary: {
          name: "پلن اصلی",
          value: (node) => booleanToValue[`${node.isPrimary}`],
          component: (node) => <BooleanToIcon value={node.isPrimary} />,
          filter: "Set",
        },
        isDefault: {
          name: "پیش‌فرض",
          value: (node) => booleanToValue[`${node.isDefault}`],
          component: (node) => <BooleanToIcon value={node.isDefault} />,
          filter: "Set",
        },
        minPrice: {
          name: "شروع قیمت",
          value: (node) => minActivePrice(node),
          component: (node) => minActivePrice(node)?.toLocaleString("fa-IR"),
          filter: "Number",
        },
        order: {
          name: "رتبه",
          value: (node) => node.order,
          filter: "Number",
          component: (node) => (
            <OrderEditor
              modelName="baseHospitalLicense"
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
                href={adminPath(`/baseHospitalLicense/${node._id}`)}
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
                      modelName="baseHospitalLicense"
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

export default AdminManageBaseHospitalLicensesPage;
